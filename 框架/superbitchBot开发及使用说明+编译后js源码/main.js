'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lodash = require('lodash');

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
var encode$1 = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
var decode$1 = function (charCode) {
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

var base64 = {
	encode: encode$1,
	decode: decode$1
};

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
var encode = function base64VLQ_encode(aValue) {
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
var decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
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

var base64Vlq = {
	encode: encode,
	decode: decode
};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/* -*- Mode: js; js-indent-level: 2; -*- */

var util = createCommonjsModule(function (module, exports) {
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

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
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
    url += ":" + aParsedUrl.port;
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
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
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
  var cmp = strcmp(mappingA.source, mappingB.source);
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

  return strcmp(mappingA.name, mappingB.name);
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
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
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

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;
});

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */


var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet$1() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet$1.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet$1();
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
ArraySet$1.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet$1.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet$1.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet$1.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet$1.prototype.at = function ArraySet_at(aIdx) {
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
ArraySet$1.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

var ArraySet_1 = ArraySet$1;

var arraySet = {
	ArraySet: ArraySet_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */

var binarySearch = createCommonjsModule(function (module, exports) {
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
});

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
var quickSort_1 = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

var quickSort$1 = {
	quickSort: quickSort_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet = arraySet.ArraySet;

var quickSort = quickSort$1.quickSort;

function SourceMapConsumer$1(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer$1.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer$1.prototype._version = 3;

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

SourceMapConsumer$1.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer$1.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer$1.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer$1.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer$1.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer$1.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer$1.GENERATED_ORDER = 1;
SourceMapConsumer$1.ORIGINAL_ORDER = 2;

SourceMapConsumer$1.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer$1.LEAST_UPPER_BOUND = 2;

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
SourceMapConsumer$1.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer$1.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer$1.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer$1.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
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
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer$1.prototype.allGeneratedPositionsFor =
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

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

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

var SourceMapConsumer_1 = SourceMapConsumer$1;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
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
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
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

  if (sourceRoot) {
    sourceRoot = util.normalize(sourceRoot);
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

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer$1.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer$1;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

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
    return this._absoluteSources.slice();
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
            base64Vlq.decode(aStr, index, temp);
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
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
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
      util.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
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

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
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
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

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
      util.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND)
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

var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
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
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
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
      consumer: new SourceMapConsumer$1(util.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer$1.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer$1;

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
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
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
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util.getArg(aArgs, 'source')) === -1) {
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
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

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

var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

var sourceMapConsumer = {
	SourceMapConsumer: SourceMapConsumer_1,
	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
};

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
var SourceMapConsumer = sourceMapConsumer.SourceMapConsumer;

/**
 * 校正异常的堆栈信息
 *
 * 由于 rollup 会打包所有代码到一个文件，所以异常的调用栈定位和源码的位置是不同的
 * 本模块就是用来将异常的调用栈映射至源代码位置
 *
 * @see https://github.com/screepers/screeps-typescript-starter/blob/master/src/utils/ErrorMapper.ts
 */
/**
  * 在绘制控制台信息时使用的颜色
  */
const errorMapcolors = {
    red: '#ef9a9a',
};
/**
  * 控制台信息打印
  */
function colorful(content, colorName = null, bolder = false) {
    const colorStyle = colorName ? `color: ${errorMapcolors[colorName]};` : '';
    const bolderStyle = bolder ? 'font-weight: bolder;' : '';
    return `<text style="${[colorStyle, bolderStyle].join(' ')}">${content}</text>`;
}
class ErrorMapper {
    static get consumer() {
        if (this._consumer == null)
            this._consumer = new SourceMapConsumer(require("main.js.map"));
        return this._consumer;
    }
    /**
      * 使用源映射生成堆栈跟踪，并生成原始标志位
      * 警告 - global 重置之后的首次调用会产生很高的 cpu 消耗 (> 30 CPU)
      * 之后的每次调用会产生较低的 cpu 消耗 (~ 0.1 CPU / 次)
      *
      * @param {Error | string} error 错误或原始追踪栈
      * @returns {string} 映射之后的源代码追踪栈
      */
    static sourceMappedStackTrace(error) {
        const stack = error instanceof Error ? error.stack : error;
        // 有缓存直接用
        if (this.cache.hasOwnProperty(stack))
            return this.cache[stack];
        const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
        let match;
        let outStack = error.toString();
        console.log("ErrorMapper -> sourceMappedStackTrace -> outStack", outStack);
        while ((match = re.exec(stack))) {
            // 解析完成
            if (match[2] !== "main")
                break;
            // 获取追踪定位
            const pos = this.consumer.originalPositionFor({
                column: parseInt(match[4], 10),
                line: parseInt(match[3], 10)
            });
            // 无法定位
            if (!pos.line)
                break;
            // 解析追踪栈
            if (pos.name)
                outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
            else {
                // 源文件没找到对应文件名，采用原始追踪名
                if (match[1])
                    outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
                // 源文件没找到对应文件名并且原始追踪栈里也没有，直接省略
                else
                    outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
            }
        }
        this.cache[stack] = outStack;
        return outStack;
    }
    /**
      * 错误追踪包装器
      * 用于把报错信息通过 source-map 解析成源代码的错误位置
      *
      * @param loop 玩家代码主循环
      */
    static wrapLoop(loop) {
        return () => {
            try {
                // 执行玩家代码
                loop();
            }
            catch (e) {
                if (e instanceof Error) {
                    // 渲染报错调用栈，沙盒模式用不了这个
                    const errorMessage = Game.rooms.sim ?
                        `沙盒模式无法使用 source-map - 显示原始追踪栈<br>${_.escape(e.stack)}` :
                        `${_.escape(this.sourceMappedStackTrace(e))}`;
                    console.log(colorful(errorMessage, 'red'));
                }
                // 处理不了，直接抛出
                else
                    throw e;
            }
        };
    }
}
// 缓存映射关系以提高性能
ErrorMapper.cache = {};

/**
 * Memory初始化
 */
function MemoryInit() {
    if (!Memory.whitesheet)
        Memory.whitesheet = [];
    if (!Memory.bypassRooms)
        Memory.bypassRooms = [];
    if (!Memory.ignoreMissonName)
        Memory.ignoreMissonName = [];
    if (!global.Gtime)
        global.Gtime = {};
    for (let i in Memory.RoomControlData)
        if (!global.Gtime[i])
            global.Gtime[i] = Game.time - lodash.random(1, 20, false);
    if (!global.SpecialBodyData)
        global.SpecialBodyData = {};
    for (let i in Memory.RoomControlData)
        if (!global.SpecialBodyData[i])
            global.SpecialBodyData[i] = {};
    if (!global.intervalData)
        global.intervalData = {};
    for (let i in global.intervalData)
        if (!global.intervalData[i])
            global.intervalData[i] = {};
    if (!global.Stru)
        global.Stru = {};
    if (!Memory.marketAdjust)
        Memory.marketAdjust = {};
    if (!Memory.ResourceDispatchData)
        Memory.ResourceDispatchData = [];
    if (!global.ResourceLimit)
        global.ResourceLimit = {};
    if (!Memory.outMineData)
        Memory.outMineData = {};
}

/* 此文件存放有关mount的基础函数 */
/**
 * name: 对象原型拓展
 * eg: asignPrototype(Creep,CreepMove)
 */
const assignPrototype = function (obj1, obj2) {
    Object.getOwnPropertyNames(obj2.prototype).forEach(key => {
        if (key.includes('Getter')) {
            Object.defineProperty(obj1.prototype, key.split('Getter')[0], {
                get: obj2.prototype[key],
                enumerable: false,
                configurable: true
            });
        }
        else
            obj1.prototype[key] = obj2.prototype[key];
    });
};

const t3 = ['XKH2O', 'XKHO2', 'XZH2O', 'XZHO2', 'XGH2O', 'XGHO2', 'XLHO2', 'XLH2O', 'XUH2O', 'XUHO2'];
const t2 = ['KH2O', 'KHO2', 'ZH2O', 'ZHO2', 'GH2O', 'GHO2', 'LHO2', 'LH2O', 'UH2O', 'UHO2'];
const t1 = ['KH', 'KO', 'GH', 'GO', 'LH', 'LO', 'ZO', 'ZH', 'UH', 'UO'];
// lab合成相关常量信息
const LabMap = {
    // 基本元素
    'OH': { raw1: 'H', raw2: 'O' },
    'ZK': { raw1: 'Z', raw2: 'K' },
    'UL': { raw1: 'U', raw2: 'L' },
    'G': { raw1: 'ZK', raw2: 'UL' },
    'GH': { raw1: 'G', raw2: 'H' },
    'GH2O': { raw1: 'GH', raw2: 'OH' },
    'XGH2O': { raw1: 'GH2O', raw2: 'X' },
    'ZO': { raw1: 'Z', raw2: 'O' },
    'ZHO2': { raw1: 'ZO', raw2: 'OH' },
    'XZHO2': { raw1: 'ZHO2', raw2: 'X' },
    'UH': { raw1: 'U', raw2: 'H' },
    'UH2O': { raw1: 'UH', raw2: 'OH' },
    'XUH2O': { raw1: 'UH2O', raw2: 'X' },
    'KH': { raw1: 'K', raw2: 'H' },
    'KH2O': { raw1: 'KH', raw2: 'OH' },
    'XKH2O': { raw1: 'KH2O', raw2: 'X' },
    'KO': { raw1: 'K', raw2: 'O' },
    'KHO2': { raw1: 'KO', raw2: 'OH' },
    'XKHO2': { raw1: 'KHO2', raw2: 'X' },
    'LH': { raw1: 'L', raw2: 'H' },
    'LH2O': { raw1: 'LH', raw2: 'OH' },
    'XLH2O': { raw1: 'LH2O', raw2: 'X' },
    'LO': { raw1: 'L', raw2: 'O' },
    'LHO2': { raw1: 'LO', raw2: 'OH' },
    'XLHO2': { raw1: 'LHO2', raw2: 'X' },
    'GO': { raw1: 'G', raw2: 'O' },
    'GHO2': { raw1: 'GO', raw2: 'OH' },
    'XGHO2': { raw1: 'GHO2', raw2: 'X' },
    'ZH': { raw1: 'Z', raw2: 'H' },
    'ZH2O': { raw1: 'ZH', raw2: 'OH' },
    'XZH2O': { raw1: 'ZH2O', raw2: 'X' },
    'UO': { raw1: 'U', raw2: 'O' },
    'UHO2': { raw1: 'UO', raw2: 'OH' },
    'XUHO2': { raw1: 'UHO2', raw2: 'X' },
};
// 化合物合成顺序 映射
const ResourceMapData = [
    /*  */
    { source: 'ZK', dis: 'G', map: [] },
    { source: 'ZK', dis: 'GH2O', map: ['G', 'GH',] },
    { source: 'ZK', dis: 'GHO2', map: ['G', 'GO'] },
    { source: 'ZK', dis: 'XGH2O', map: ['G', 'GH', 'GH2O'] },
    { source: 'ZK', dis: 'XGHO2', map: ['G', 'GO', 'GHO2'] },
    { source: 'G', dis: 'GH2O', map: ['GH2O'] },
    { source: 'G', dis: 'XGH2O', map: ['GH2O', 'GH'] },
    { source: 'G', dis: 'GHO2', map: ['GHO2'] },
    { source: 'G', dis: 'XGHO2', map: ['GHO2', 'GO'] },
    { source: 'GO', dis: 'GHO2', map: [] },
    { source: 'GO', dis: 'XGHO2', map: ['GHO2'] },
    { source: 'GH', dis: 'GH2O', map: [] },
    { source: 'GH', dis: 'XGH2O', map: ['GH2O'] },
    { source: 'GHO2', dis: 'XGHO2', map: [] },
    { source: 'GH2O', dis: 'XGH2O', map: [] },
    { source: 'UL', dis: 'G', map: [] },
    { source: 'UL', dis: 'GH2O', map: ['G', 'GH',] },
    { source: 'UL', dis: 'GHO2', map: ['G', 'GO',] },
    { source: 'UL', dis: 'XGH2O', map: ['G', 'GH', 'GH2O'] },
    { source: 'UL', dis: 'XGHO2', map: ['G', 'GO', 'GHO2'] },
    { source: 'UH', dis: 'UH2O', map: [] },
    { source: 'UH', dis: 'XUH2O', map: ['UH2O',] },
    { source: 'UH2O', dis: 'XUH2O', map: [] },
    { source: 'UO', dis: 'UHO2', map: [] },
    { source: 'UO', dis: 'XUHO2', map: ['UHO2',] },
    { source: 'UHO2', dis: 'XUHO2', map: [] },
    { source: 'KH', dis: 'KH2O', map: [] },
    { source: 'KH', dis: 'XKH2O', map: ['KH2O'] },
    { source: 'KH2O', dis: 'XKH2O', map: [] },
    { source: 'KO', dis: 'KHO2', map: [] },
    { source: 'KO', dis: 'XKHO2', map: ['KHO2',] },
    { source: 'KHO2', dis: 'XKHO2', map: [] },
    { source: 'LH', dis: 'LH2O', map: [] },
    { source: 'LH', dis: 'XLH2O', map: ['LH2O'] },
    { source: 'LH2O', dis: 'XLH2O', map: [] },
    { source: 'LO', dis: 'LHO2', map: [] },
    { source: 'LO', dis: 'XLHO2', map: ['LHO2'] },
    { source: 'LHO2', dis: 'XLHO2', map: [] },
    { source: 'ZH', dis: 'ZH2O', map: [] },
    { source: 'ZH', dis: 'XZH2O', map: ['ZH2O'] },
    { source: 'ZH2O', dis: 'XZH2O', map: [] },
    { source: 'ZO', dis: 'ZHO2', map: [] },
    { source: 'ZO', dis: 'XZHO2', map: ['ZHO2'] },
    { source: 'ZHO2', dis: 'XZHO2', map: [] },
    { source: 'OH', dis: 'GH2O', map: [] },
    { source: 'OH', dis: 'GHO2', map: [] },
    { source: 'OH', dis: 'XGH2O', map: ['GH2O'] },
    { source: 'OH', dis: 'XGHO2', map: ['GHO2'] },
    { source: 'OH', dis: 'UH2O', map: [] },
    { source: 'OH', dis: 'XUH2O', map: ['UH2O'] },
    { source: 'OH', dis: 'UHO2', map: [] },
    { source: 'OH', dis: 'XUHO2', map: ['UHO2'] },
    { source: 'OH', dis: 'LH2O', map: [] },
    { source: 'OH', dis: 'XLH2O', map: ['LH2O'] },
    { source: 'OH', dis: 'LHO2', map: [] },
    { source: 'OH', dis: 'XLHO2', map: ['LHO2'] },
    { source: 'OH', dis: 'KH2O', map: [] },
    { source: 'OH', dis: 'XKH2O', map: ['KH2O'] },
    { source: 'OH', dis: 'KHO2', map: [] },
    { source: 'OH', dis: 'XKHO2', map: ['KHO2'] },
    { source: 'OH', dis: 'ZH2O', map: [] },
    { source: 'OH', dis: 'XZH2O', map: ['ZH2O'] },
    { source: 'OH', dis: 'ZHO2', map: [] },
    { source: 'OH', dis: 'XZHO2', map: ['ZHO2'] },
];
// 化合物合成规划数据
const resourceComDispatch = {
    'G': ['ZK', 'UL', 'G'],
    'UH': ['UH'],
    'UH2O': ['UH', 'OH', 'UH2O'],
    'XUH2O': ['UH', 'OH', 'UH2O', 'XUH2O'],
    'UO': ['UO'],
    'UHO2': ['UO', 'OH', 'UHO2'],
    'XUHO2': ['UO', 'OH', 'UHO2', 'XUHO2'],
    'GH': ['ZK', 'UL', 'G', 'GH'],
    'GH2O': ['ZK', 'UL', 'G', 'GH', 'OH', 'GH2O'],
    'XGH2O': ['ZK', 'UL', 'G', 'GH', 'OH', 'GH2O', 'XGH2O'],
    'GO': ['ZK', 'UL', 'G', , 'GO'],
    'GHO2': ['ZK', 'UL', 'G', 'GO', 'OH', 'GHO2'],
    'XGHO2': ['ZK', 'UL', 'G', 'GO', 'OH', 'GHO2', 'XGHO2'],
    'LH': ['LH'],
    'LH2O': ['LH', 'LH2O'],
    'XLH2O': ['LH', 'OH', 'LH2O', 'XLH2O'],
    'LO': ['LO'],
    'LHO2': ['LO', 'OH', 'LHO2'],
    'XLHO2': ['LO', 'OH', 'LHO2', 'XLHO2'],
    'KH': ['KH'],
    'KH2O': ['KH', 'OH', 'KH2O'],
    'XKH2O': ['KH', 'OH', 'KH2O', 'XKH2O'],
    'KO': ['KO'],
    'KHO2': ['KO', 'OH', 'KHO2'],
    'XKHO2': ['KO', 'OH', 'KHO2', 'XKHO2'],
    'ZH': ['ZH'],
    'ZH2O': ['ZH', 'OH', 'ZH2O'],
    'XZH2O': ['ZH', 'OH', 'ZH2O', 'XZH2O'],
    'ZO': ['ZO'],
    'ZHO2': ['ZO', 'OH', 'ZHO2'],
    'XZHO2': ['ZO', 'OH', 'ZHO2', 'XZHO2'],
    'UL': ['UL'],
    'ZK': ['ZK'],
    'OH': ['OH']
};

/* 存放全局方法 */
/*  判定是否在列表里 */
function isInArray(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (value === arr[i]) {
            return true;
        }
    }
    return false;
}
/* 用于多structure类型的filter判断 */
function filter_structure(structure, arr) {
    return isInArray(arr, structure.structureType);
}
/* 寻找列表中hit最小且没有超过指定值的建筑  模式0 为hit最小， 模式1为hit差值最小 模式2为hits/hitsMax比值最小*/
function LeastHit(arr, mode = 0, radio) {
    if (arr.length > 0) {
        var ret = arr[0];
        if (mode == 0) {
            for (var index of arr) {
                if (index.hits < ret.hits)
                    ret = index;
            }
            return ret;
        }
        if (mode == 1) {
            for (var index of arr) {
                if ((index.hitsMax - index.hits) > (ret.hitsMax - ret.hits))
                    ret = index;
            }
            return ret;
        }
        if (mode == 2) {
            for (var index of arr) {
                if ((index.hits / index.hitsMax) < (ret.hits / ret.hitsMax))
                    ret = index;
            }
            if (radio) {
                if (ret.hits / ret.hitsMax < radio)
                    return ret;
                else
                    return undefined;
            }
            else {
                return ret;
            }
        }
    }
    return undefined;
}
/* 获取两点间距离(勾股定理) */
function getDistance(po1, po2) {
    return Math.sqrt((po1.x - po2.x) ** 2 + (po1.y - po2.y) ** 2);
}
/* 生成爬虫指定体型 */
function GenerateAbility(work, carry, move, attack, range_attack, heal, claim, tough) {
    var body_list = [];
    // 生成优先级，越往前越优先
    if (tough)
        body_list = AddList(body_list, tough, TOUGH);
    if (work)
        body_list = AddList(body_list, work, WORK);
    if (attack)
        body_list = AddList(body_list, attack, ATTACK);
    if (range_attack)
        body_list = AddList(body_list, range_attack, RANGED_ATTACK);
    if (carry)
        body_list = AddList(body_list, carry, CARRY);
    if (claim)
        body_list = AddList(body_list, claim, CLAIM);
    if (move)
        body_list = AddList(body_list, move, MOVE);
    if (heal)
        body_list = AddList(body_list, heal, HEAL);
    return body_list;
}
// 用于对bodypartconstant[] 列表进行自适应化，使得爬虫房间能生产该爬虫，具体逻辑为寻找该bodypart中数量最多的，对其进行减法运算，直到达到目的，但数量到1时将不再减少
function adaption_body(arr, critical_num) {
    while (CalculateEnergy(arr) > critical_num) {
        if (critical_num <= 100)
            return arr;
        let m_body = most_body(arr);
        if (!m_body) {
            return arr;
        }
        var index = arr.indexOf(m_body);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }
    return arr;
}
// 寻找身体部件中数量最多的部件
function most_body(arr) {
    let bN = {};
    if (!arr || arr.length <= 0) {
        console.log("【自适应】列表有问题");
        return null;
    }
    for (let bc of arr) {
        if (!bN[bc])
            bN[bc] = getSameNum(bc, arr);
    }
    let bM = null;
    if (Object.keys(bN).length == 1)
        return arr[0];
    for (let i in bN) {
        if (bN[i] > 1 && ((bM == null) ? (bN[i] > 1) : (bN[i] > bN[bM])))
            bM = i;
    }
    if (!bM) {
        console.log("【自适应】查找最多部件数量错误 arr:", arr);
        return null;
    }
    return bM;
}
/**
     * 获取数组中相同元素的个数
     * @param val 相同的元素
     * @param arr 传入数组
     */
function getSameNum(val, arr) {
    var processArr = [];
    for (var i of arr) {
        if (i == val)
            processArr.push(i);
    }
    return processArr.length;
}
/* 判断孵化所需能量 */
function CalculateEnergy(abilityList) {
    var num = 0;
    for (var part of abilityList) {
        if (part == WORK)
            num += 100;
        if (part == MOVE)
            num += 50;
        if (part == CARRY)
            num += 50;
        if (part == ATTACK)
            num += 80;
        if (part == RANGED_ATTACK)
            num += 150;
        if (part == HEAL)
            num += 250;
        if (part == CLAIM)
            num += 600;
        if (part == TOUGH)
            num += 10;
    }
    return num;
}
/* 向列表中添加指定数量元素 */
function AddList(arr, time_, element) {
    var list_ = arr;
    for (var i = 0; i < time_; i++) {
        list_.push(element);
    }
    return list_;
}
/* 按照列表中某个属性进行排序 配合sort使用 */
function compare(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    };
}
/* 正则获取房间信息 return {coor:['E','S'],num:[44,45]} */
function regularRoom$1(roomName) {
    var roomName = roomName;
    const regRoom = /[A-Z]/g;
    const regNum = /\d{1,2}/g;
    let Acoord = regRoom.exec(roomName)[0];
    let AcoordNum = parseInt(regNum.exec(roomName)[0]);
    let Bcoord = regRoom.exec(roomName)[0];
    let BcoordNum = parseInt(regNum.exec(roomName)[0]);
    return { coor: [Acoord, Bcoord], num: [AcoordNum, BcoordNum] };
}
/* 计算两个房间之间的距离   */
function roomDistance(roomName1, roomName2) {
    var Data1 = regularRoom$1(roomName1);
    var Data2 = regularRoom$1(roomName2);
    var Xdistance = 0;
    var Ydistance = 0;
    if (Data1.coor[0] == Data2.coor[0]) {
        Xdistance = Math.abs(Data1.num[0] - Data2.num[0]);
    }
    else {
        /* 过渡处 */
        Xdistance = 2 * Data1.num[0];
    }
    if (Data1.coor[1] == Data2.coor[1]) {
        Ydistance = Math.abs(Data1.num[1] - Data2.num[1]);
    }
    else {
        /* 过渡处 */
        Ydistance = 2 * Data1.num[1];
    }
    return Xdistance > Ydistance ? Xdistance : Ydistance;
}
/* 获取两个房间之间最近的星门房 */
function closestPotalRoom(roomName1, roomName2) {
    var Data1 = regularRoom$1(roomName1);
    var Data2 = regularRoom$1(roomName2);
    /* 分别计算距离每个房间最近的portal房，如果两个房的最近是相等的就return该房 */
    /* 如果不相等，就对比 A房--A最近Portal房距离 + A最近Portal房--B房距离 和 B房--B最近Portal房距离 + B最近Portal房--A房距离*/
    var NData1R = `${Data1.coor[0]}${Data1.num[0] % 10 > 5 ? Data1.num[0] + (10 - Data1.num[0] % 10) : Data1.num[0] - Data1.num[0] % 10}${Data1.coor[1]}${Data1.num[1] % 10 > 5 ? Data1.num[1] + (10 - Data1.num[1] % 10) : Data1.num[1] - Data1.num[1] % 10}`;
    var NData2R = `${Data2.coor[0]}${Data2.num[0] % 10 > 5 ? Data2.num[0] + (10 - Data2.num[0] % 10) : Data2.num[0] - Data2.num[0] % 10}${Data2.coor[1]}${Data2.num[1] % 10 > 5 ? Data2.num[1] + (10 - Data2.num[1] % 10) : Data2.num[1] - Data2.num[1] % 10}`;
    if (NData1R == NData2R)
        return NData1R;
    else {
        var Adistance = roomDistance(roomName1, NData1R) + roomDistance(roomName2, NData1R);
        var Bdistance = roomDistance(roomName1, NData2R) + roomDistance(roomName2, NData2R);
        if (Adistance > Bdistance)
            return NData2R;
        else
            return NData1R;
    }
}
/* 获取指定方向相反的方向 */
function getOppositeDirection(direction) {
    return ((direction + 3) % 8 + 1);
}
const colors$2 = {
    red: '#ef9a9a',
    green: '#6b9955',
    yellow: '#c5c599',
    blue: '#8dc5e3',
    orange: '#ff9d00',
};
function Colorful$1(content, colorName = null, bolder = false) {
    const colorStyle = colorName ? `color: ${colors$2[colorName] ? colors$2[colorName] : colorName};` : '';
    const bolderStyle = bolder ? 'font-weight: bolder;' : '';
    return `<text style="${[colorStyle, bolderStyle].join(' ')}">${content}</text>`;
}
/* 生成一个不会重复的ID */
function generateID() {
    return Math.random().toString(36).substr(3) + `${Game.time}`;
}
/* 压缩位置函数 */
function zipPosition(position) {
    let x = position.x;
    let y = position.y;
    let room = position.roomName;
    return `${x}/${y}/${room}`;
}
/* 将压缩出来的字符串解压 例如 23/42/W1N1 */
function unzipPosition(str) {
    var info = str.split('/');
    return info.length == 3 ? new RoomPosition(Number(info[0]), Number(info[1]), info[2]) : undefined;
}

// 计算平均价格
function avePrice(res, day) {
    if (day > 14)
        return 0; // 0
    let allprice = 0;
    let history = Game.market.getHistory(res);
    for (var ii = 14 - day; ii < 14; ii++)
        allprice += history[ii].avgPrice;
    let avePrice = allprice / day; // 平均能量价格
    return avePrice;
}
// 判断是否已经有相应order了s
function haveOrder(roomName, res, mtype, nowPrice, range) {
    if (!nowPrice) //  不考虑价格
     {
        for (let i in Game.market.orders) {
            let order = Game.market.getOrderById(i);
            if (order.remainingAmount <= 0) {
                Game.market.cancelOrder(i);
                continue;
            }
            if (order.roomName == roomName && order.resourceType == res && order.type == mtype)
                return true;
        }
        return false;
    }
    else // 考虑价格区间
     {
        for (let i in Game.market.orders) {
            let order = Game.market.getOrderById(i);
            if (order.amount <= 0 || !order.active) {
                Game.market.cancelOrder(i);
                continue;
            }
            if (order.roomName == roomName && order.resourceType == res && order.type == mtype && order.price >= (nowPrice + range))
                return true;
        }
        return false;
    }
}
// 计算一定范围内的最高价格
function highestPrice(res, mtype, mprice) {
    let allOrder = Game.market.getAllOrders({ type: mtype, resourceType: res });
    let highestPrice = 0;
    for (var i of allOrder) {
        if (i.price > highestPrice) {
            if (mprice) {
                if (i.price <= mprice)
                    highestPrice = i.price;
            }
            else {
                highestPrice = i.price;
            }
        }
    }
    if (mprice && highestPrice == 0)
        highestPrice = mprice;
    return highestPrice;
}
// 识别lab 合成 or 底物  [轮子]
function RecognizeLab(roomname) {
    var room = Game.rooms[roomname];
    if (!room)
        return null;
    var labs = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } });
    if (labs.length < 3)
        return null;
    var centerLabs = [, , []];
    var obj = { centerLabs: [], otherLabs: [] };
    for (let i = 0; i < labs.length; i++) {
        let labA = labs[i];
        for (let j = i + 1; j < labs.length; j++) {
            let labB = labs[j];
            let otherLabs = [];
            if (labA.pos.inRangeTo(labB, 5))
                labs.forEach(labC => {
                    if (labC != labA && labC != labB && labA.pos.inRangeTo(labC, 2) && labB.pos.inRangeTo(labC, 2)) {
                        otherLabs.push(labC);
                    }
                });
            if (otherLabs.length > centerLabs[2].length) {
                centerLabs = [labA, labB, otherLabs];
                if (centerLabs[0]) {
                    obj.centerLabs = [centerLabs[0].id, centerLabs[1].id];
                    obj.otherLabs = centerLabs[2].map(e => e.id);
                }
                else {
                    obj.centerLabs = []; //中央lab
                    obj.otherLabs = []; //剩下lab
                }
            }
        }
    }
    if (obj.centerLabs.length < 2 || obj.otherLabs.length <= 0)
        return null;
    return { raw1: obj.centerLabs[0], raw2: obj.centerLabs[1], com: obj.otherLabs };
}
// 判断是否存在该房间相关资源的调用信息 true 存在 false 不存在
function checkDispatch(roomName, resource) {
    for (let i of Memory.ResourceDispatchData) {
        if (i.sourceRoom == roomName && i.rType == resource)
            return true;
    }
    return false;
}
// 该房间资资源调度数量
function DispatchNum(roomName) {
    let num = 0;
    for (let i of Memory.ResourceDispatchData) {
        if (i.sourceRoom == roomName)
            num++;
    }
    return num;
}
// 判断其他房间是否存在往该房间的资源调度
function checkSend(roomName, resource) {
    for (let i in Memory.RoomControlData) {
        if (!Game.rooms[i] || !Game.rooms[i].memory.Misson || !Game.rooms[i].memory.Misson['Structure'])
            continue;
        for (var t of Game.rooms[i].memory.Misson['Structure']) {
            if (t.name == '资源传送' && t.Data.rType == resource && t.Data.disRoom == roomName)
                return true;
        }
    }
    return false;
}
/* 判断目标资源的上级资源是否已经达到要求 */
function resourceMap(rType, disType) {
    if (isInArray(['XGH2O', 'XGHO2', 'XLH2O', 'XLHO2', 'XUH2O', 'XUHO2', 'XKH2O', 'XKHO2', 'XZH2O', 'XZHO2'], rType)) {
        console.log("是", rType, ' 返回空列表');
        return [];
    }
    for (var i of ResourceMapData) {
        if (i.source == rType && i.dis == disType) {
            return i.map;
        }
    }
    console.log("resourceMap返回了空列表");
    return [];
}
/* 判断爬虫是否是值得防御的目标 */
function deserveDefend(creep) {
    for (var b of creep.body) {
        if (b.boost && isInArray(['XGHO2', 'XKHO2', 'XUHO2', 'XZH2O'], b.boost)) {
            return true;
        }
    }
    return false;
}
/* 判断爬虫是否有某类型部件 */
function parts(creep, bo) {
    for (var b of creep.body) {
        if (b.type == bo)
            return true;
    }
    return false;
}
/* 爬虫攻击部件数据 */
function hurts(creep) {
    var result = { 'attack': 0, 'ranged_attack': 0 };
    for (var i of creep.body) {
        if (i.type == 'attack') {
            if (!i.boost)
                result['attack'] += 30;
            else if (i.boost == 'UH')
                result['attack'] += 60;
            else if (i.boost == 'UH2O')
                result['attack'] += 90;
            else if (i.boost == 'XUH2O')
                result['attack'] += 120;
        }
        else if (i.type == 'ranged_attack') {
            if (!i.boost)
                result['ranged_attack'] += 10;
            else if (i.boost == 'KO')
                result['ranged_attack'] += 20;
            else if (i.boost == 'KHO2')
                result['ranged_attack'] += 30;
            else if (i.boost == 'XKHO2')
                result['ranged_attack'] += 40;
        }
    }
    return result;
}
/* 寻找后一级的爬 */
function findNextData(creep) {
    if (!creep.memory.squad)
        return null;
    for (var i in creep.memory.squad) {
        if (creep.memory.squad[i].index - creep.memory.squad[creep.name].index == 1) {
            return i;
        }
    }
    return null;
}
/* 判断两个房间是否靠近以及目标房间 (必须是有出口的靠近)*/
function identifyNext(thisRoom, disRoom) {
    var thisRoomData = regularRoom(thisRoom);
    var disRoomData = regularRoom(disRoom);
    if (thisRoomData.coor[0] == disRoomData.coor[0] && thisRoomData.coor[1] == disRoomData.coor[1]) {
        var Xdistanceabs = Math.abs(thisRoomData.num[0] - disRoomData.num[0]);
        var Ydistanceabs = Math.abs(thisRoomData.num[1] - disRoomData.num[1]);
        if ((Xdistanceabs == 0 && Ydistanceabs == 1) || (Xdistanceabs == 1 && Ydistanceabs == 0) && Game.rooms[thisRoom].findExitTo(disRoom) != -2 && Game.rooms[thisRoom].findExitTo(disRoom) != -10) {
            return true;
        }
    }
    return false;
}
function regularRoom(roomName) {
    var roomName = roomName;
    const regRoom = /[A-Z]/g;
    const regNum = /\d{1,2}/g;
    let Acoord = regRoom.exec(roomName)[0];
    let AcoordNum = parseInt(regNum.exec(roomName)[0]);
    let Bcoord = regRoom.exec(roomName)[0];
    let BcoordNum = parseInt(regNum.exec(roomName)[0]);
    return { coor: [Acoord, Bcoord], num: [AcoordNum, BcoordNum] };
}
/* 判断是否可以组队了  需要一个方块的位置都没有墙壁，而且坐标需要 5 -> 45 */
function identifyGarrison(creep) {
    if (creep.pos.x > 45 || creep.pos.x < 5 || creep.pos.y > 45 || creep.pos.y < 5)
        return false;
    for (var i = creep.pos.x; i < creep.pos.x + 2; i++)
        for (var j = creep.pos.y; j < creep.pos.y + 2; j++) {
            var thisPos = new RoomPosition(i, j, creep.room.name);
            if (thisPos.lookFor(LOOK_TERRAIN)[0] == 'wall') {
                return false;
            }
            if (thisPos.GetStructureList(['spawn', 'constructedWall', 'rampart', 'observer', 'link', 'nuker', 'storage', 'tower', 'terminal', 'powerSpawn', 'extension']).length > 0)
                return false;
        }
    return true;
}
/* 寻找前一级的爬 */
function findFollowData(creep) {
    if (!creep.memory.squad)
        return null;
    for (var i in creep.memory.squad) {
        if (creep.memory.squad[creep.name].index - creep.memory.squad[i].index == 1) {
            return i;
        }
    }
    return null;
}

/* 跨shard基本操作函数 */
/**
 * 基本定义
 * 跨shard记忆是个对象包含creep和misson两个大分支，creep里存储以爬虫名字为key的爬虫记忆，并定时清除,Misson里包含以任务ID为Key的任务
 *
 * {
 *     creep:
 *      {
 *          ...
 *          creep1:          // 爬虫名称
 *          {
 *              MemoryData:{},
 *              state: 0/1  // 状态码：0代表还未传输、1代表已经传输
 *              delay:1500 超时倒计时   // 超过1500tick将自动删除,所有爬虫数据均是如此
 *          },
 *          ...
 *      },
 *      misson:
 *      {
 *          ...
 *          Cskfvde23nf34:   // 任务ID
 *          {
 *              MemoryData:{},
 *              state: 0/1  // 状态码：0代表还未传输、1代表已经传输
 *              delay:5000  // 超过5000tick将自动删除
 *          }
 *      },
 *      shardName: shard3    // 脚本运行shard名,
 *      communication:
 *      {
 *          state: 0 //状态码: 0代表无请求、1代表请求发送、2代表发送成功、3代表接受成功 同时只能发送一种数据/只能一方发给另外一方
 *          sourceShard: shard3 // 源shard
 *          relateShard: shard2 // 想要通讯的shard
 *          data: {} // 爬虫或者任务的数据
 *          type: 1  // 类型：1代表爬虫数据、2代表任务数据
 *          delay: 200     // 超时倒计时
 *      }
 * }
 *
 */
/* ShardMemory数据初始化 */
function InitShardMemory() {
    if (Game.time % 10)
        return;
    var Data = JSON.parse(InterShardMemory.getLocal()) || {};
    if (Object.keys(Data).length < 3 || !Data['creep'] || !Data['misson']) {
        InterShardMemory.setLocal(JSON.stringify({ 'creep': {}, 'misson': {}, shardName: Game.shard.name }));
        console.log('已经初始化', Game.shard.name, '的InterShardMemory!');
        return;
    }
    /* 爬虫shard记忆超时计算 */
    for (var cData in Data['creep']) {
        Data['creep'][cData].delay -= 10;
        if (Data['creep'][cData].delay <= 0)
            delete Data['creep'][cData];
        if (Game.creeps[cData] && Game.creeps[cData].memory.role)
            delete Data['creep'][cData];
        /* 如果记忆已经成功赋予了就删除 */
        // if (Game.creeps[cData] && Game.creeps[cData].memory.role)
        //     delete  Data['creep'][cData]
    }
    /* 任务shard记忆超时计算 */
    for (var mData in Data['misson']) {
        Data['misson'][mData].delay -= 10;
        if (Data['misson'][mData].delay <= 0)
            delete Data['misson'][mData];
    }
    /* 通信更新 */
    if (Data['communication']) {
        Data['communication'].delay -= 10;
        if (Data['communication'].delay <= 0)
            delete Data['communication'];
    }
    /* 记忆更新 */
    InterShardMemory.setLocal(JSON.stringify(Data));
}
/* 获取其他shard的数据 */
function GetShardCommunication(shardName) {
    if (shardName == Game.shard.name)
        return null;
    var Data = JSON.parse(InterShardMemory.getRemote(shardName)) || {};
    if (Object.keys(Data).length < 3)
        return null; // 说明该shard不存在InterShardMemory
    if (!Data['communication'])
        return null;
    return Data['communication'];
}
/* 请求传输数据到目标shard */
function RequestShard(req) {
    var thisData = JSON.parse(InterShardMemory.getLocal());
    if (thisData.communication && thisData.communication.state != 0)
        return false;
    thisData.communication = {
        state: 1,
        relateShard: req.relateShard,
        sourceShard: req.sourceShard,
        type: req.type,
        data: req.data,
        delay: 100,
    };
    InterShardMemory.setLocal(JSON.stringify(thisData));
    return true;
}
/* 响应目标shard的传输数据 并将其拷贝到自己的记忆里 */
function ResponseShard(shardName) {
    var comData = GetShardCommunication(shardName);
    if (comData === null)
        return false;
    if (comData.state != 1 || comData.relateShard != Game.shard.name)
        return false;
    var thisData = JSON.parse(InterShardMemory.getLocal());
    if (thisData.communication && thisData.communication['relateShard'] != Game.shard.name)
        return false; // 在忙中，无法响应
    thisData.communication = {
        state: 2,
        relateShard: comData.relateShard,
        sourceShard: comData.sourceShard,
        type: comData.type,
        data: comData.data,
        delay: 100,
    };
    if (comData.type == 1) {
        thisData['creep'][comData.data['id']] = { MemoryData: comData.data['MemoryData'], delay: 100, state: 1 };
    }
    else if (comData.type == 2) {
        thisData['misson'][comData.data['id']] = { MemoryData: comData.data['MemoryData'], delay: 50, state: 1 };
    }
    InterShardMemory.setLocal(JSON.stringify(thisData));
    // 响应成功
    return true;
}
/* 确认目标shard已经收到了数据 */
function ConfirmShard() {
    var thisData = JSON.parse(InterShardMemory.getLocal());
    if (!thisData.communication)
        return false;
    var comData = GetShardCommunication(thisData.communication['relateShard']);
    if (comData === null)
        return false;
    if (comData.state != 2 || comData.relateShard != thisData.communication['relateShard'])
        return false;
    if (comData.state == 2) {
        thisData.communication.state = 3;
        delete thisData.communication.data;
        InterShardMemory.setLocal(JSON.stringify(thisData));
        // 响应成功
        return true;
    }
    return false;
}
/* 删除communication */
function DeleteShard() {
    var thisData = JSON.parse(InterShardMemory.getLocal());
    if (!thisData.communication)
        return false;
    if (Game.shard.name == thisData.communication['relateShard']) {
        var Data = JSON.parse(InterShardMemory.getRemote(thisData.communication['sourceShard'])) || {};
        console.log(Data['communication'].state);
        if (Data['communication'].state == 3) {
            delete thisData.communication;
            InterShardMemory.setLocal(JSON.stringify(thisData));
            return true;
        }
        return false;
    }
    else if (Game.shard.name == thisData.communication['sourceShard']) {
        /* 只需要确定对方是否还有communication */
        var Data = JSON.parse(InterShardMemory.getRemote(thisData.communication['relateShard'])) || {};
        if (!Data['communication']) {
            delete thisData.communication;
            InterShardMemory.setLocal(JSON.stringify(thisData));
            return true;
        }
        return false;
    }
    return false;
}
/* 跨shard运行主函数 */
function InterShardRun() {
    var Data = JSON.parse(InterShardMemory.getLocal()) || {};
    if (Object.keys(Data).length < 3) {
        return;
    }
    /* 没有通话状态，就一直监听 */
    if (!Data.communication) {
        var allShardList = ['shard1', 'shard2', 'shard3'];
        var thisShardList = _.difference(allShardList, [Game.shard.name]);
        for (var s of thisShardList) {
            if (ResponseShard(s))
                return;
        }
    }
    else {
        if (Data.communication.state == 1) {
            // if(ConfirmShard()) return
            // else console.log(`${Game.shard.name} ConfirmShard遇到问题`)
            ConfirmShard();
        }
        else if (Data.communication.state == 2) {
            DeleteShard();
        }
        else if (Data.communication.state == 3) {
            DeleteShard();
        }
    }
}

// import { RequestShard } from "@/shard/base"
/* 本地寻路移动 */
class CreepMoveExtension extends Creep {
    // 位置标准化
    standardizePos(pos) {
        return `${pos.roomName}/${pos.x}/${pos.y}/${Game.shard.name}`;
    }
    // 寻找不允许对穿的爬虫的位置
    getStandedPos() {
        var standedCreep = this.room.find(FIND_MY_CREEPS, { filter: (creep) => {
                return (creep.memory.standed == true || (creep.memory.crossLevel && this.memory.crossLevel && creep.memory.crossLevel > this.memory.crossLevel));
            } });
        if (standedCreep.length > 0) {
            var posList = [];
            for (var i of standedCreep) {
                posList.push(i.pos);
            }
            return posList;
        }
        return [];
    }
    // 通用寻路
    findPath(target, range) {
        /* 全局路线存储 */
        if (!global.routeCache)
            global.routeCache = {};
        if (!this.memory.moveData)
            this.memory.moveData = {};
        this.memory.moveData.index = 0;
        /* 查找全局中是否已经有预定路线，如果有了就直接返回路线 */
        const routeKey = `${this.standardizePos(this.pos)} ${this.standardizePos(target)}`;
        var route = global.routeCache[routeKey];
        if (route && this.room.name != target.roomName) {
            return route;
        }
        // 过道路口优先
        let allowedRooms = { [this.pos.roomName]: true, [target.roomName]: true };
        let swi = false;
        if (target.roomName != this.room.name) {
            let myroomparsed = Number((/^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.room.name)));
            let disRoomparsed = Number((/^[WE]([0-9]+)[NS]([0-9]+)$/.exec(target.roomName)));
            /* 计算距离 如果两个房间之间距离过短就不这样做 */
            let enoughDistance = Math.sqrt(Math.abs(myroomparsed[0] - disRoomparsed[0]) ** 2 + Math.abs(myroomparsed[1] - disRoomparsed[1]) ** 2);
            if (enoughDistance > 4.3)
                swi = true;
            if (swi) {
                let ret = Game.map.findRoute(this.pos.roomName, target.roomName, {
                    routeCallback(roomName) {
                        // 在全局绕过房间列表的房间 false
                        if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName))
                            return Infinity;
                        let parsed = Number((/^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName)));
                        let isHighway = (parsed[1] % 10 === 0) ||
                            (parsed[2] % 10 === 0);
                        let isMyRoom = Game.rooms[roomName] &&
                            Game.rooms[roomName].controller &&
                            Game.rooms[roomName].controller.my;
                        if (isHighway || isMyRoom) {
                            return 1;
                        }
                        else {
                            return 2;
                        }
                    }
                });
                if (ret != ERR_NO_PATH) {
                    ret.forEach(function (info) {
                        allowedRooms[info.room] = true;
                    });
                }
            }
        }
        /* 路线查找 */
        const result = PathFinder.search(this.pos, { pos: target, range: range }, {
            plainCost: 2,
            swampCost: 5,
            maxOps: target.roomName == this.room.name ? 1000 : 8000,
            roomCallback: roomName => {
                // 在全局绕过房间列表的房间 false
                if (!swi && Memory.bypassRooms && Memory.bypassRooms.includes(roomName))
                    return false;
                if (swi && allowedRooms[roomName] === undefined) {
                    return false;
                }
                // 在爬虫记忆绕过房间列表的房间 false
                const room = Game.rooms[roomName];
                // 没有视野的房间只观察地形
                if (!room)
                    return;
                // 有视野的房间
                let costs = new PathFinder.CostMatrix;
                // 将道路的cost设置为1，无法行走的建筑设置为255
                room.find(FIND_STRUCTURES).forEach(struct => {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        costs.set(struct.pos.x, struct.pos.y, 1);
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER &&
                        (struct.structureType !== STRUCTURE_RAMPART || !struct.my))
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                });
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(cons => {
                    if (cons.structureType != 'road' && cons.structureType != 'rampart' && cons.structureType != 'container')
                        costs.set(cons.pos.x, cons.pos.y, 255);
                });
                /* 防止撞到其他虫子造成堵虫 */
                room.find(FIND_HOSTILE_CREEPS).forEach(creep => {
                    costs.set(creep.pos.x, creep.pos.y, 255);
                });
                room.find(FIND_MY_CREEPS).forEach(creep => {
                    if ((creep.memory.crossLevel && creep.memory.crossLevel > this.memory.crossLevel) || creep.memory.standed)
                        costs.set(creep.pos.x, creep.pos.y, 255);
                    else
                        costs.set(creep.pos.x, creep.pos.y, 3);
                });
                return costs;
            }
        });
        // 寻路异常返回null
        if (result.path.length <= 0)
            return null;
        // 寻路结果压缩
        route = this.serializeFarPath(result.path);
        if (!result.incomplete)
            global.routeCache[routeKey] = route;
        return route;
    }
    // 使用寻路结果移动
    goByPath() {
        if (!this.memory.moveData)
            return ERR_NO_PATH;
        const index = this.memory.moveData.index;
        // 移动索引超过数组上限代表到达目的地
        if (index >= this.memory.moveData.path.length) {
            delete this.memory.moveData.path;
            return OK;
        }
        // 获取方向，进行移动
        const direction = Number(this.memory.moveData.path[index]);
        const goResult = this.go(direction);
        // 移动成功，更新下次移动索引
        if (goResult == OK)
            this.memory.moveData.index++;
        return goResult;
    }
    // 通用移动 (配合findPath 和 goByPath)
    goTo(target, range = 1) {
        //  var a = Game.cpu.getUsed()
        if (this.memory.moveData == undefined)
            this.memory.moveData = {};
        // 确认目标没有变化，如果变化了就重新规划路线
        const targetPosTag = this.standardizePos(target);
        if (targetPosTag !== this.memory.moveData.targetPos) {
            this.memory.moveData.targetPos = targetPosTag;
            this.memory.moveData.path = this.findPath(target, range);
        }
        // 确认缓存有没有被清除
        if (!this.memory.moveData.path) {
            this.memory.moveData.path = this.findPath(target, range);
        }
        // 还为空的话就是没有找到路径
        if (!this.memory.moveData.path) {
            delete this.memory.moveData.path;
            return OK;
        }
        // 使用缓存进行移动
        const goResult = this.goByPath();
        // 如果发生撞停或者参数异常，说明缓存可能存在问题，移除缓存
        if (goResult === ERR_INVALID_TARGET) {
            delete this.memory.moveData;
        }
        else if (goResult != OK && goResult != ERR_TIRED) {
            this.say(`异常码：${goResult}`);
        }
        // var b = Game.cpu.getUsed()
        // this.say(`${b-a}`)
        return goResult;
    }
    // 请求对穿 按照对穿等级划分 等级高的可以任意对穿等级低的，等级低的无法请求等级高的对穿，等级相等则不影响
    requestCross(direction) {
        if (!this.memory.crossLevel)
            this.memory.crossLevel = 10; // 10为默认对穿等级
        // 获取目标方向一格的位置
        const fontPos = this.pos.directionToPos(direction);
        // 在出口、边界
        if (!fontPos)
            return ERR_NOT_FOUND;
        const fontCreep = (fontPos.lookFor(LOOK_CREEPS)[0] || fontPos.lookFor(LOOK_POWER_CREEPS)[0]);
        if (!fontCreep)
            return ERR_NOT_FOUND;
        if (fontCreep.owner.username != this.owner.username)
            return;
        this.say("👉");
        if (fontCreep.manageCross(getOppositeDirection(direction), this.memory.crossLevel))
            this.move(direction);
        return OK;
    }
    // 处理对穿
    manageCross(direction, crossLevel) {
        if (!this.memory.crossLevel)
            this.memory.crossLevel = 10;
        if (!this.memory)
            return true;
        if (this.memory.standed || this.memory.crossLevel > crossLevel) {
            if (!(Game.time % 5))
                this.say('👊');
            return false;
        }
        // 同意对穿
        this.say('👌');
        this.move(direction);
        return true;
    }
    // 单位移动 (goByPath中的移动基本函数)
    go(direction) {
        const moveResult = this.move(direction);
        if (moveResult != OK)
            return moveResult;
        // 如果ok的话，有可能撞上东西了或者一切正常
        const currentPos = `${this.pos.x}/${this.pos.y}`;
        if (this.memory.prePos && currentPos == this.memory.prePos) {
            // 这个时候确定在原点驻留了
            const crossResult = this.memory.disableCross ? ERR_BUSY : this.requestCross(direction);
            if (crossResult != OK) {
                delete this.memory.moveData;
                return ERR_INVALID_TARGET;
            }
        }
        this.memory.prePos = currentPos;
        return OK;
    }
    /* 压缩路径 */
    serializeFarPath(positions) {
        if (positions.length == 0)
            return '';
        // 确保路径里第一个位置是自己当前的位置
        if (!positions[0].isEqualTo(this.pos))
            positions.splice(0, 0, this.pos);
        return positions.map((pos, index) => {
            // 最后一个位置就不用再移动
            if (index >= positions.length - 1)
                return null;
            // 由于房间边缘地块会有重叠，所以这里筛除掉重叠的步骤
            if (pos.roomName != positions[index + 1].roomName)
                return null;
            // 获取到下个位置的方向
            return pos.getDirectionTo(positions[index + 1]);
        }).join('');
    }
    // 跨shard移动
    arriveTo(target, range, shard = Game.shard.name) {
        if (!this.memory.targetShard)
            this.memory.targetShard = shard;
        if (shard == Game.shard.name) {
            this.goTo(target, range);
        }
        else {
            if (!this.memory.protalRoom) 
            // 寻找最近的十字路口房间
            {
                if (Game.flags[`${this.memory.belong}/portal`]) {
                    this.memory.protalRoom = Game.flags[`${this.memory.belong}/portal`].room.name;
                }
                else {
                    this.memory.protalRoom = closestPotalRoom(this.memory.belong, target.roomName);
                }
            }
            if (!this.memory.protalRoom || this.memory.protalRoom == null)
                return;
            if (this.room.name != this.memory.protalRoom) {
                this.goTo(new RoomPosition(25, 25, this.memory.protalRoom), 20);
            }
            else {
                /* 寻找星门 */
                var portal = this.room.find(FIND_STRUCTURES, { filter: (structure) => {
                        return structure.structureType == STRUCTURE_PORTAL;
                    } });
                if (portal.length <= 0)
                    return;
                var thisportal;
                for (var i of portal) {
                    var porType = i.destination;
                    if (porType.shard == shard)
                        thisportal = i;
                }
                if (!thisportal)
                    return;
                if (!this.pos.isNearTo(thisportal))
                    this.goTo(thisportal.pos, 1);
                else {
                    /* moveData里的shardmemory */
                    /* 靠近后等待信息传送 */
                    var RequestData = {
                        relateShard: shard,
                        sourceShard: Game.shard.name,
                        type: 1,
                        data: { id: this.name, MemoryData: this.memory }
                    };
                    if (RequestShard(RequestData)) {
                        this.moveTo(thisportal);
                    }
                }
            }
        }
        return;
    }
    // 主动防御寻路
    findPath_defend(target, range) {
        /* 全局路线存储 */
        if (!global.routeCache)
            global.routeCache = {};
        if (!this.memory.moveData)
            this.memory.moveData = {};
        this.memory.moveData.index = 0;
        const routeKey = `${this.standardizePos(this.pos)} ${this.standardizePos(target)}`;
        /* 路线查找 */
        const result = PathFinder.search(this.pos, { pos: target, range: range }, {
            plainCost: 3,
            swampCost: 10,
            maxOps: 600,
            roomCallback: roomName => {
                // 在全局绕过房间列表的房间 false
                if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName))
                    return false;
                // 在爬虫记忆绕过房间列表的房间 false
                if (this.memory.bypassRooms && this.memory.bypassRooms.includes(roomName))
                    return false;
                const room = Game.rooms[roomName];
                // 没有视野的房间只观察地形
                if (!room)
                    return;
                // 有视野的房间
                let costs = new PathFinder.CostMatrix;
                /* 设置主动防御范围 */
                if (room.name == this.memory.belong) {
                    /* 将房间边界设置为255 */
                    for (var x = 0; x < 50; x++)
                        for (var y = 0; y < 50; y++) {
                            if (isInArray([0, 49], x) || isInArray([0, 49], y)) {
                                costs.set(x, y, 255);
                            }
                        }
                }
                // 将rampart设置为 1 
                room.find(FIND_MY_STRUCTURES).forEach(struct => {
                    if (struct.structureType === STRUCTURE_RAMPART) {
                        costs.set(struct.pos.x, struct.pos.y, 1);
                    }
                });
                // 将道路的cost设置为2，无法行走的建筑设置为255
                room.find(FIND_STRUCTURES).forEach(struct => {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        costs.set(struct.pos.x, struct.pos.y, 2);
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER &&
                        (struct.structureType !== STRUCTURE_RAMPART || !struct.my))
                        costs.set(struct.pos.x, struct.pos.y, 255);
                });
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(cons => {
                    if (cons.structureType != 'road' && cons.structureType != 'rampart' && cons.structureType != 'container')
                        costs.set(cons.pos.x, cons.pos.y, 255);
                });
                room.find(FIND_HOSTILE_CREEPS).forEach(creep => {
                    if (parts(creep, 'ranged_attack') && hurts(creep)['ranged_attack'] > 1000) {
                        for (var i = creep.pos.x - 3; i < creep.pos.x + 4; i++)
                            for (var j = creep.pos.y - 3; j < creep.pos.y + 4; j++)
                                if (i > 0 && i < 49 && j > 0 && j < 49) {
                                    var nearpos = new RoomPosition(i, j, creep.room.name);
                                    if (!nearpos.GetStructure('rampart'))
                                        costs.set(i, j, 20);
                                }
                    }
                });
                /* 防止撞到其他虫子造成堵虫 */
                room.find(FIND_HOSTILE_CREEPS).forEach(creep => {
                    costs.set(creep.pos.x, creep.pos.y, 255);
                });
                room.find(FIND_MY_CREEPS).forEach(creep => {
                    if ((creep.memory.crossLevel && creep.memory.crossLevel > this.memory.crossLevel) || creep.memory.standed)
                        costs.set(creep.pos.x, creep.pos.y, 255);
                    else
                        costs.set(creep.pos.x, creep.pos.y, 3);
                });
                return costs;
            }
        });
        // 寻路异常返回null
        if (result.path.length <= 0)
            return null;
        // 寻路结果压缩
        var route = this.serializeFarPath(result.path);
        if (!result.incomplete)
            global.routeCache[routeKey] = route;
        return route;
    }
    /* 主动防御移动 */
    goTo_defend(target, range = 1) {
        Game.cpu.getUsed();
        if (this.memory.moveData == undefined)
            this.memory.moveData = {};
        // 确认目标没有变化，如果变化了就重新规划路线
        this.memory.moveData.path = this.findPath_defend(target, range);
        // 还为空的话就是没有找到路径
        if (!this.memory.moveData.path) {
            delete this.memory.moveData.path;
            return OK;
        }
        // 使用缓存进行移动
        const goResult = this.goByPath();
        // 如果发生撞停或者参数异常，说明缓存可能存在问题，移除缓存
        if (goResult === ERR_INVALID_TARGET) {
            delete this.memory.moveData;
        }
        else if (goResult != OK && goResult != ERR_TIRED) {
            this.say(`异常码：${goResult}`);
        }
        Game.cpu.getUsed();
        //this.say(`b-a`)
        return goResult;
    }
}

const BoostedPartData = {
    'UH': 'attack',
    'UH2O': 'attack',
    'XUH2O': 'attack',
    'UO': 'work',
    'UHO2': 'work',
    'XUHO2': 'work',
    'KH': 'carry',
    'KH2O': 'carry',
    'XKH2O': 'carry',
    'KO': 'ranged_attack',
    'KHO2': 'ranged_attack',
    'XKHO2': 'ranged_attack',
    'LH': 'work',
    'LH2O': 'work',
    'XLH2O': 'work',
    'LO': 'heal',
    'LHO2': 'heal',
    'XLHO2': 'heal',
    'ZH': 'work',
    'ZH2O': 'work',
    'XZH2O': 'work',
    'ZO': 'move',
    'ZHO2': 'move',
    'XZHO2': 'move',
    'GH': 'work',
    'GH2O': 'work',
    'XGH2O': 'work',
    'GO': 'tough',
    'GHO2': 'tough',
    'XGHO2': 'tough',
};

/* 爬虫原型拓展   --功能  --功能 */
class CreepFunctionExtension extends Creep {
    /**
     *
     * working状态
     */
    workstate(rType = RESOURCE_ENERGY) {
        if (!this.memory.working)
            this.memory.working = false;
        if (this.memory.working && this.store[rType] == 0) {
            this.memory.working = false;
        }
        if (!this.memory.working && this.store.getFreeCapacity() == 0) {
            this.memory.working = true;
        }
    }
    harvest_(source_) {
        if (this.harvest(source_) == ERR_NOT_IN_RANGE) {
            this.goTo(source_.pos, 1);
            this.memory.standed = false;
        }
        else
            this.memory.standed = true;
    }
    transfer_(distination, rType = RESOURCE_ENERGY) {
        if (this.transfer(distination, rType) == ERR_NOT_IN_RANGE) {
            this.goTo(distination.pos, 1);
        }
        this.memory.standed = false;
    }
    upgrade_() {
        if (this.room.controller) {
            if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                this.goTo(this.room.controller.pos, 1);
                this.memory.standed = false;
            }
            else
                this.memory.standed = true;
        }
    }
    // 考虑到建筑和修复有可能造成堵虫，所以解除钉扎状态
    build_(distination) {
        if (this.build(distination) == ERR_NOT_IN_RANGE) {
            this.goTo(distination.pos, 1);
            this.memory.standed = false;
        }
        else
            this.memory.standed = true;
    }
    repair_(distination) {
        if (this.repair(distination) == ERR_NOT_IN_RANGE) {
            this.goTo(distination.pos, 1);
            this.memory.standed = false;
        }
        else
            this.memory.standed = true;
    }
    withdraw_(distination, rType = RESOURCE_ENERGY) {
        if (this.withdraw(distination, rType) == ERR_NOT_IN_RANGE) {
            this.goTo(distination.pos, 1);
        }
        this.memory.standed = false;
    }
    // 确认是否boost了,并进行相应Boost
    BoostCheck(boostBody) {
        for (var body in this.memory.boostData) {
            if (!isInArray(boostBody, body))
                continue;
            if (!this.memory.boostData[body].boosted) {
                var tempID;
                var thisRoomMisson = Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id);
                if (!thisRoomMisson)
                    return false;
                LoopB: for (var j in thisRoomMisson.LabBind) {
                    if (BoostedPartData[thisRoomMisson.LabBind[j]] && body == BoostedPartData[thisRoomMisson.LabBind[j]]) {
                        tempID = j;
                        break LoopB;
                    }
                }
                if (!tempID)
                    continue;
                var disLab = Game.getObjectById(tempID);
                if (!disLab)
                    continue;
                // 计算body部件
                let s = 0;
                for (var b of this.body) {
                    if (b.type == body)
                        s++;
                }
                if (!disLab.mineralType)
                    return false;
                if (!this.pos.isNearTo(disLab))
                    this.goTo(disLab.pos, 1);
                else {
                    for (var i of this.body) {
                        if (i.type == body && i.boost != thisRoomMisson.LabBind[tempID]) {
                            disLab.boostCreep(this);
                            return false;
                        }
                    }
                    this.memory.boostData[body] = { boosted: true, num: s, type: thisRoomMisson.LabBind[tempID] };
                }
                return false;
            }
        }
        return true;
    }
    // 召唤所有房间内的防御塔治疗/攻击 自己/爬虫 [不一定成功]
    optTower(otype, creep) {
        if (this.room.name != this.memory.belong || Game.shard.name != this.memory.shard)
            return;
        for (var i of Game.rooms[this.memory.belong].memory.StructureIdData.AtowerID) {
            let tower_ = Game.getObjectById(i);
            if (!tower_)
                continue;
            if (otype == 'heal') {
                tower_.heal(creep);
            }
            else {
                tower_.attack(creep);
            }
        }
    }
    isInDefend(creep) {
        for (var i in Game.rooms[this.memory.belong].memory.enemy) {
            for (var id of Game.rooms[this.memory.belong].memory.enemy[i])
                if (creep.id == id)
                    return true;
        }
        return false;
    }
}

/* 爬虫原型拓展   --任务  --任务基础 */
class CreepMissonBaseExtension extends Creep {
    ManageMisson() {
        if (this.spawning)
            return;
        if (!this.memory.MissionData)
            this.memory.MissionData = {};
        /* 生命低于10就将资源上交 */
        if (this.ticksToLive < 10 && (isInArray(['transport', 'manage'], this.memory.role))) {
            let storage_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.storageID);
            if (!storage_)
                return;
            if (this.store.getUsedCapacity() > 0) {
                for (let i in this.store) {
                    this.transfer_(storage_, i);
                    return;
                }
            }
            return;
        }
        if (Object.keys(this.memory.MissionData).length <= 0) {
            if (this.memory.taskRB) {
                let task_ = Game.rooms[this.memory.belong].GainMission(this.memory.taskRB);
                if (task_) {
                    task_.CreepBind[this.memory.role].bind.push(this.name);
                    this.memory.MissionData.id = task_.id; // 任务id
                    this.memory.MissionData.name = task_.name; // 任务名
                    this.memory.MissionData.Data = task_.Data ? task_.Data : {}; // 任务数据传输
                    return;
                }
            }
            /* 每任务的情况下考虑领任务 */
            if (!Game.rooms[this.memory.belong].memory.Misson['Creep'])
                Game.rooms[this.memory.belong].memory.Misson['Creep'] = [];
            let taskList = Game.rooms[this.memory.belong].memory.Misson['Creep'];
            let thisTaskList = [];
            for (let Stask of taskList) {
                if (Stask.CreepBind && isInArray(Object.keys(Stask.CreepBind), this.memory.role))
                    thisTaskList.push(Stask);
            }
            if (thisTaskList.length <= 0) {
                /* 没任务就处理剩余资源 */
                if (this.room.name != this.memory.belong)
                    return;
                let st = this.store;
                if (!st)
                    return;
                for (let i of Object.keys(st)) {
                    let storage_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.storageID);
                    if (!storage_)
                        return;
                    this.say("🛒");
                    if (this.transfer(storage_, i) == ERR_NOT_IN_RANGE)
                        this.goTo(storage_.pos, 1);
                    return;
                }
                return;
            }
            else {
                /* 还没有绑定的任务，就等待接取任务 */
                LoopBind: for (var t of thisTaskList) {
                    if (t.CreepBind && t.CreepBind[this.memory.role] && t.CreepBind[this.memory.role].bind.length < t.CreepBind[this.memory.role].num) {
                        /* 绑定任务了就输入任务数据 */
                        t.processing = true; // 领取任务后，任务开始计时
                        t.CreepBind[this.memory.role].bind.push(this.name);
                        this.memory.MissionData.id = t.id; // 任务id
                        this.memory.MissionData.name = t.name; // 任务名
                        this.memory.MissionData.Data = t.Data ? t.Data : {}; // 任务数据传输
                        // this.memory.MissionData.Sata = t.Sata?t.Sata:{}
                        break LoopBind;
                    }
                }
                if (Object.keys(this.memory.MissionData).length <= 0)
                    this.say("💤");
                return;
            }
        }
        else {
            switch (this.memory.MissionData.name) {
                case '虫卵填充': {
                    this.handle_feed();
                    break;
                }
                case '物流运输': {
                    this.handle_carry();
                    break;
                }
                case '墙体维护': {
                    this.handle_repair();
                    break;
                }
                case 'C计划': {
                    this.handle_planC();
                    break;
                }
                case '黄球拆迁': {
                    this.handle_dismantle();
                    break;
                }
                case '急速冲级': {
                    this.handle_quickRush();
                    break;
                }
                case '扩张援建': {
                    this.handle_expand();
                    break;
                }
                case '紧急支援': {
                    this.handle_support();
                    break;
                }
                case '控制攻击': {
                    this.handle_control();
                    break;
                }
                case '紧急援建': {
                    this.handle_helpBuild();
                    break;
                }
                case '房间签名': {
                    this.handle_sign();
                    break;
                }
                case '攻防一体': {
                    this.handle_aio();
                    break;
                }
                case '原矿开采': {
                    this.handle_mineral();
                    break;
                }
                case '外矿开采': {
                    this.handle_outmine();
                    break;
                }
                case 'power采集': {
                    this.handle_power();
                    break;
                }
                case 'deposit采集': {
                    this.handle_deposit();
                    break;
                }
                case '红球防御': {
                    this.handle_defend_attack();
                    break;
                }
                case '蓝球防御': {
                    this.handle_defend_range();
                    break;
                }
                case '双人防御': {
                    this.handle_defend_double();
                    break;
                }
                case '四人小队': {
                    this.handle_task_squard();
                    break;
                }
            }
        }
    }
}

/* 爬虫原型拓展   --任务  --搬运工任务 */
class CreepMissonTransportExtension extends Creep {
    handle_feed() {
        if (!this.room.memory.StructureIdData.storageID)
            return;
        var storage_ = Game.getObjectById(this.room.memory.StructureIdData.storageID);
        if (!storage_)
            return;
        this.workstate('energy');
        for (var r in this.store) {
            if (r != 'energy') {
                this.say("🚽");
                /* 如果是自己的房间，则优先扔到最近的storage去 */
                if (this.room.name == this.memory.belong) {
                    if (!this.room.memory.StructureIdData.storageID)
                        return;
                    var storage = Game.getObjectById(this.room.memory.StructureIdData.storageID);
                    if (!storage)
                        return;
                    if (storage.store.getUsedCapacity() > this.store.getUsedCapacity()) {
                        this.transfer_(storage, r);
                    }
                    else
                        return;
                }
                return;
            }
        }
        if (this.memory.working) {
            this.say("🍉");
            var extensions = this.pos.findClosestByRange(FIND_STRUCTURES, { filter: (structure) => {
                    return (structure.structureType == 'spawn' || structure.structureType == 'extension') && structure.store.getFreeCapacity('energy') > 0;
                } });
            if (extensions) {
                if (this.transfer(extensions, 'energy') == ERR_NOT_IN_RANGE)
                    this.goTo(extensions.pos, 1);
            }
            else {
                /* 完成就删除任务和自己的记忆 */
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                this.memory.MissionData = {};
            }
        }
        else {
            if (storage_.store['energy'] >= this.store.getCapacity())
                this.withdraw_(storage_, 'energy');
            else {
                let terminal_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.terminalID);
                if (terminal_ && terminal_.store.getUsedCapacity('energy') >= this.store.getCapacity())
                    this.withdraw_(terminal_, 'energy');
            }
        }
    }
    /* 物资运输任务  已测试 */
    handle_carry() {
        var Data = this.memory.MissionData.Data;
        /* 数据不全拒绝执行任务 */
        if (!Data || Object.keys(Data).length < 7) {
            Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
            return;
        }
        if (Data.rType) {
            this.say(`📦${Data.rType}`);
            /* 指定了资源类型 */
            this.workstate(Data.rType);
            /* 清除杂质 */
            for (var r in this.store) {
                /* 清除杂志 */
                if (r != Data.rType) {
                    this.say("🚽");
                    /* 如果是自己的房间，则优先扔到最近的storage去 */
                    if (this.room.name == this.memory.belong) {
                        if (!this.room.memory.StructureIdData.storageID)
                            return;
                        var storage = Game.getObjectById(this.room.memory.StructureIdData.storageID);
                        if (!storage)
                            return;
                        if (storage.store.getFreeCapacity() > this.store.getUsedCapacity(r)) {
                            this.transfer_(storage, r);
                        }
                        else
                            return;
                    }
                    return;
                }
            }
            if (Data.num) {
                /* 如果指定了num-- 任务结束条件：[搬运了指定num] */
                if (this.memory.working) {
                    var thisPos = new RoomPosition(Data.targetPosX, Data.targetPosY, Data.targetRoom);
                    if (!thisPos) {
                        Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                        return;
                    }
                    if (!this.pos.isNearTo(thisPos))
                        this.goTo(thisPos, 1);
                    else {
                        /* 寻找 */
                        var targets = thisPos.GetStructureList(['terminal', 'storage', 'tower', 'powerSpawn', 'container', 'factory', 'nuker', 'lab', 'link']);
                        if (targets.length > 0) {
                            var target = targets[0];
                            var capacity = this.store[Data.rType];
                            /* 如果送货正确，就减少房间主任务中的num，num低于0代表任务完成 */
                            if (this.transfer(target, Data.rType) == OK) {
                                var thisMisson = Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id);
                                if (thisMisson) {
                                    thisMisson.Data.num -= capacity;
                                    if (thisMisson.Data.num <= 0) {
                                        Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                                        return;
                                    }
                                }
                            }
                            else {
                                /* 目标满了、不是正确目标、目标消失了也代表任务完成 */
                                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                                return;
                            }
                        }
                        else {
                            Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                            return;
                        }
                    }
                }
                else {
                    /*  */
                    var disPos = new RoomPosition(Data.sourcePosX, Data.sourcePosY, Data.sourceRoom);
                    if (!disPos) {
                        Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                        return;
                    }
                    if (!this.pos.isNearTo(disPos))
                        this.goTo(disPos, 1);
                    else {
                        var targets = disPos.GetStructureList(['terminal', 'storage', 'tower', 'powerSpawn', 'container', 'factory', 'nuker', 'lab', 'link']);
                        if (targets.length > 0) {
                            var target = targets[0];
                            if ((!target.store || target.store[Data.rType] == 0) && this.store.getUsedCapacity(Data.rType) <= 0) {
                                /* 如果发现没资源了，就取消搬运任务 */
                                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                                return;
                            }
                            /* 如果已经没资源了 */
                            var thisMisson = Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id);
                            if (thisMisson.Data.num < this.store.getCapacity() && target.store[Data.rType] && target.store[Data.rType] >= thisMisson.Data.num) {
                                this.withdraw(target, Data.rType, thisMisson.Data.num);
                                this.memory.working = true;
                                return;
                            }
                            if (target.store.getUsedCapacity(Data.rType) < this.store.getUsedCapacity()) {
                                this.withdraw(target, Data.rType);
                                this.memory.working = true;
                                return;
                            }
                            if (this.withdraw(target, Data.rType) == ERR_NOT_ENOUGH_RESOURCES) {
                                this.memory.working = true;
                            }
                        }
                    }
                }
            }
            else {
                /* 未指定数目-- 任务结束条件：[source 空了 或 target 满了] */
                if (this.memory.working) {
                    var thisPos = new RoomPosition(Data.targetPosX, Data.targetPosY, Data.targetRoom);
                    if (!thisPos) {
                        Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                        return;
                    }
                    if (!this.pos.isNearTo(thisPos))
                        this.goTo(thisPos, 1);
                    else {
                        /* 寻找 */
                        var targets = thisPos.GetStructureList(['terminal', 'storage', 'tower', 'powerSpawn', 'container', 'factory', 'nuker', 'lab', 'link']);
                        if (targets.length > 0) {
                            var target = targets[0];
                            var capacity = this.store[Data.rType];
                            if (this.transfer(target, Data.rType) != OK) {
                                /* 目标满了、不是正确目标、目标消失了也代表任务完成 */
                                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                                return;
                            }
                            // 对于类似于防御塔正在使用能量的任务
                            if (target.store.getFreeCapacity() < 50) {
                                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                                return;
                            }
                        }
                        else {
                            Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                            return;
                        }
                    }
                }
                else {
                    /* 清除杂质 */
                    for (var r in this.store) {
                        if (r != Data.rType) {
                            this.say("🚽");
                            /* 如果是自己的房间，则优先扔到最近的storage去 */
                            if (this.room.name == this.memory.belong) {
                                if (!this.room.memory.StructureIdData.storageID)
                                    return;
                                var storage = Game.getObjectById(this.room.memory.StructureIdData.storageID);
                                if (!storage)
                                    return;
                                if (storage.store.getUsedCapacity() > this.store.getUsedCapacity()) {
                                    this.transfer_(storage, r);
                                }
                                else
                                    return;
                            }
                            return;
                        }
                    }
                    /*  */
                    var disPos = new RoomPosition(Data.sourcePosX, Data.sourcePosY, Data.sourceRoom);
                    if (!disPos) {
                        Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                        return;
                    }
                    if (!this.pos.isNearTo(disPos))
                        this.goTo(disPos, 1);
                    else {
                        var targets = disPos.GetStructureList(['terminal', 'storage', 'tower', 'powerSpawn', 'container', 'factory', 'nuker', 'lab', 'link']);
                        if (targets.length > 0) {
                            var target = targets[0];
                            if ((!target.store || target.store[Data.rType] == 0) && this.store.getUsedCapacity(Data.rType) == 0) {
                                /* 如果发现没资源了，就取消搬运任务 */
                                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                                return;
                            }
                            else {
                                this.withdraw(target, Data.rType);
                                this.memory.working = true;
                            }
                        }
                    }
                }
            }
        }
        else {
            this.say(`📦`);
            /* 未指定资源类型 */
            /* working状态转换条件 */
            if (!this.memory.working)
                this.memory.working = false;
            if (this.memory.working) {
                if (!this.store || Object.keys(this.store).length <= 0)
                    this.memory.working = false;
            }
            else {
                if (this.store.getFreeCapacity() == 0)
                    this.memory.working = true;
            }
            if (Data.num) {
                /* 不考虑这种类型的任务 */
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                return;
            }
            else {
                /* 只考虑这种任务 */
                if (this.memory.working) {
                    var thisPos = new RoomPosition(Data.targetPosX, Data.targetPosY, Data.targetRoom);
                    if (!thisPos) {
                        Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                        return;
                    }
                    if (!this.pos.isNearTo(thisPos))
                        this.goTo(thisPos, 1);
                    else {
                        /* 寻找 */
                        var targets = thisPos.GetStructureList(['terminal', 'storage', 'tower', 'powerSpawn', 'container', 'factory', 'nuker', 'lab', 'link']);
                        if (targets.length > 0) {
                            var target = targets[0];
                            var capacity = this.store[Data.rType];
                            /* 如果送货正确，就减少房间主任务中的num，num低于0代表任务完成 */
                            for (var i in this.store) {
                                if (this.transfer(target, i) != OK) {
                                    /* 目标满了、不是正确目标、目标消失了也代表任务完成 */
                                    Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                                    return;
                                }
                            }
                        }
                        else {
                            Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                            return;
                        }
                    }
                }
                else {
                    var disPos = new RoomPosition(Data.sourcePosX, Data.sourcePosY, Data.sourceRoom);
                    if (!disPos) {
                        Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                        return;
                    }
                    if (!this.pos.isNearTo(disPos))
                        this.goTo(disPos, 1);
                    else {
                        var targets = disPos.GetStructureList(['terminal', 'storage', 'tower', 'powerSpawn', 'container', 'factory', 'nuker', 'lab', 'link']);
                        var ruin = disPos.GetRuin();
                        if (targets.length > 0 || ruin) {
                            var target = targets[0];
                            var targetR = ruin;
                            if (target) {
                                if (!target.store || target.store.getUsedCapacity() == 0) {
                                    /* 如果发现没资源了，就取消搬运任务 */
                                    Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                                    return;
                                }
                                for (var t in target.store) {
                                    this.withdraw(target, t);
                                }
                                return;
                            }
                            if (targetR) {
                                if (!targetR.store || targetR.store.getUsedCapacity() == 0) {
                                    /* 如果发现没资源了，就取消搬运任务 */
                                    Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                                    return;
                                }
                                for (var t in targetR.store) {
                                    this.withdraw(targetR, t);
                                }
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
}

/* 爬虫原型拓展   --任务  --任务行为 */
class CreepMissonActionExtension extends Creep {
    // 刷墙 未完成
    handle_repair() {
        let missionData = this.memory.MissionData;
        let id = missionData.id;
        let mission = Game.rooms[this.memory.belong].GainMission(id);
        if (!id)
            return;
        let storage_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.storageID);
        // if (!storage_){delete Game.rooms[this.memory.belong].memory.StructureIdData.storageID;return}
        this.workstate('energy');
        /* boost检查 暂缺 */
        if (mission.LabBind) {
            // 需要boost检查，必要情况下可以不检查
            let boo = false;
            for (var ids in mission.LabBind) {
                var lab_ = Game.getObjectById(ids);
                if (!lab_ || !lab_.mineralType || lab_.store.getUsedCapacity(lab_.mineralType) < 500)
                    boo = true;
            }
            if (!boo) {
                if (!this.BoostCheck(['work']))
                    return;
            }
        }
        if (mission.Data.RepairType == 'global') {
            if (this.memory.working) {
                if (this.memory.targetID) {
                    this.say("🛠️");
                    var target_ = Game.getObjectById(this.memory.targetID);
                    if (!target_) {
                        delete this.memory.targetID;
                        return;
                    }
                    this.repair_(target_);
                }
                else {
                    var leastRam = this.room.getListHitsleast([STRUCTURE_RAMPART, STRUCTURE_WALL], 3);
                    if (!leastRam)
                        return;
                    this.memory.targetID = leastRam.id;
                }
                delete this.memory.containerID;
            }
            else {
                /* 寻找hits最小的墙 */
                var leastRam = this.room.getListHitsleast([STRUCTURE_RAMPART, STRUCTURE_WALL], 3);
                if (!leastRam)
                    return;
                this.memory.targetID = leastRam.id;
                if (!this.memory.containerID) {
                    var tank = this.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (stru) => {
                            return stru.structureType == 'storage' ||
                                (stru.structureType == 'link' && isInArray(Game.rooms[this.memory.belong].memory.StructureIdData.comsume_link, stru.id) && stru.store.getUsedCapacity('energy') > this.store.getCapacity());
                        } });
                    if (tank)
                        this.memory.containerID = tank.id;
                    else {
                        let closestStore = this.pos.findClosestByRange(FIND_STRUCTURES, { filter: (stru) => { return (stru.structureType == 'container' || stru.structureType == 'tower') && stru.store.getUsedCapacity('energy') >= this.store.getFreeCapacity(); } });
                        if (closestStore)
                            this.withdraw_(closestStore, 'energy');
                        return;
                    }
                }
                let tank_ = Game.getObjectById(this.memory.containerID);
                this.withdraw_(tank_, 'energy');
                // if(storage_)
                // this.withdraw_(storage_,'energy')
                // else
                // {
                //     let closestStore = this.pos.findClosestByRange(FIND_STRUCTURES,{filter:(stru)=>{return (stru.structureType == 'container' || stru.structureType == 'tower') && stru.store.getUsedCapacity('energy') >= this.store.getFreeCapacity()}})
                //     if (closestStore)this.withdraw_(closestStore,'energy')
                // }
            }
        }
        else if (mission.Data.RepairType == 'nuker') {
            // 核弹防御
            /* 防核函数  测试成功！*/
            if (!Game.rooms[this.memory.belong].memory.nukeData)
                return;
            if (Object.keys(Game.rooms[this.memory.belong].memory.nukeData.damage).length <= 0) {
                Game.rooms[this.memory.belong].DeleteMission(id);
                return;
            }
            /* 优先修spawn和terminal */
            if (!this.memory.targetID) {
                for (var dmgPoint in Game.rooms[this.memory.belong].memory.nukeData.damage) {
                    if (Game.rooms[this.memory.belong].memory.nukeData.damage[dmgPoint] <= 0)
                        continue;
                    var position_ = unzipPosition(dmgPoint);
                    if (!position_.GetStructure('rampart')) {
                        position_.createConstructionSite('rampart');
                        if (!this.memory.working)
                            this.withdraw_(storage_, 'energy');
                        else
                            this.build_(position_.lookFor(LOOK_CONSTRUCTION_SITES)[0]);
                        return;
                    }
                    this.memory.targetID = position_.GetStructure('rampart').id;
                    return;
                }
                if (!Game.rooms[this.memory.belong].DeleteMission(id))
                    this.memory.MissionData = {};
                return;
            }
            else {
                if (!this.memory.working) {
                    this.memory.standed = false;
                    this.withdraw_(storage_, 'energy');
                }
                else {
                    this.memory.standed = false;
                    if (this.memory.crossLevel > 10)
                        this.memory.crossLevel = 10 - Math.ceil(Math.random() * 10);
                    var wall_ = Game.getObjectById(this.memory.targetID);
                    var strPos = zipPosition(wall_.pos);
                    if (!wall_ || wall_.hits >= Game.rooms[this.memory.belong].memory.nukeData.damage[strPos] + Game.rooms[this.memory.belong].memory.nukeData.rampart[strPos] + 500000) {
                        delete this.memory.targetID;
                        Game.rooms[this.memory.belong].memory.nukeData.damage[strPos] = 0;
                        Game.rooms[this.memory.belong].memory.nukeData.rampart[strPos] = 0;
                        return;
                    }
                    if (this.repair(wall_) == ERR_NOT_IN_RANGE) {
                        this.goTo(wall_.pos, 3);
                    }
                }
                return;
            }
        }
    }
    // C计划
    handle_planC() {
        let mission = this.memory.MissionData;
        // if (Game.rooms[mission.Data.disRoom] && !Game.rooms[mission.Data.disRoom].controller.safeMode) Game.rooms[mission.Data.disRoom].controller.activateSafeMode()
        if (this.memory.role == 'cclaim') {
            if (this.room.name != mission.Data.disRoom || Game.shard.name != mission.Data.shard) {
                this.arriveTo(new RoomPosition(25, 25, mission.Data.disRoom), 20, mission.Data.shard);
                return;
            }
            else {
                if (!this.pos.isNearTo(this.room.controller))
                    this.goTo(this.room.controller.pos, 1);
                else {
                    if (!this.room.controller.owner)
                        this.claimController(this.room.controller);
                    this.signController(this.room.controller, 'better to rua BB cat at home!');
                }
            }
            // if (Game.rooms[mission.Data.disRoom].controller.level && Game.rooms[mission.Data.disRoom].controller.owner)
            // {
            //     mission.CreepBind[this.memory.role].num = 0
            // }
        }
        else {
            this.workstate('energy');
            if (this.room.name == this.memory.belong && !this.memory.working) {
                let store = this.pos.findClosestByRange(FIND_STRUCTURES, { filter: (stru) => {
                        return (stru.structureType == 'container' ||
                            stru.structureType == 'tower' ||
                            stru.structureType == 'storage') && stru.store.getUsedCapacity('energy') >= this.store.getFreeCapacity();
                    } });
                if (store) {
                    this.withdraw_(store, 'energy');
                }
                return;
            }
            if (!Game.rooms[mission.Data.disRoom]) {
                this.goTo(new RoomPosition(25, 25, mission.Data.disRoom), 20);
                return;
            }
            if (Game.rooms[mission.Data.disRoom].controller.level >= 2) {
                global.SpecialBodyData[this.memory.belong]['cupgrade'] = GenerateAbility(1, 1, 1, 0, 0, 0, 0, 0);
            }
            if (this.memory.working) {
                if (this.room.name != mission.Data.disRoom) {
                    this.goTo(Game.rooms[mission.Data.disRoom].controller.pos, 1);
                    return;
                }
                let cons = this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (cons)
                    this.build_(cons);
                else {
                    this.upgrade_();
                    this.say("cupgrade");
                }
            }
            else {
                let source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                if (source)
                    this.harvest_(source);
            }
        }
    }
    // 扩张援建
    handle_expand() {
        let missionData = this.memory.MissionData;
        let id = missionData.id;
        let mission = Game.rooms[this.memory.belong].GainMission(id);
        if (!mission)
            return;
        if (this.room.name != mission.Data.disRoom) {
            this.goTo(new RoomPosition(24, 24, mission.Data.disRoom), 20);
            return;
        }
        this.workstate('energy');
        if (this.memory.role == 'claim') {
            if (!this.pos.isNearTo(Game.rooms[mission.Data.disRoom].controller))
                this.goTo(Game.rooms[mission.Data.disRoom].controller.pos, 1);
            else {
                this.claimController(Game.rooms[mission.Data.disRoom].controller);
                this.say("claim");
            }
            if (Game.rooms[mission.Data.disRoom].controller.level && Game.rooms[mission.Data.disRoom].controller.owner) {
                mission.CreepBind[this.memory.role].num = 0;
            }
        }
        else if (this.memory.role == 'Ebuild') {
            if (this.memory.working) {
                /* 优先遭建筑 */
                let cons = this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                if (cons) {
                    this.build_(cons);
                    return;
                }
                let roads = this.pos.findClosestByRange(FIND_STRUCTURES, { filter: (stru) => {
                        return (stru.structureType == 'road' || stru.structureType == 'container') && stru.hits < stru.hitsMax;
                    } });
                if (roads) {
                    this.repair_(roads);
                    return;
                }
                let tower = this.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == 'tower' && stru.store.getFreeCapacity('energy') > 0;
                    } });
                if (tower) {
                    this.transfer_(tower, 'energy');
                    return;
                }
                let store = this.pos.getClosestStore();
                if (store) {
                    this.transfer_(store, 'energy');
                    return;
                }
            }
            else {
                let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (source)
                    this.harvest_(source);
                if (this.ticksToLive < 120 && this.store.getUsedCapacity('energy') <= 20)
                    this.suicide();
            }
        }
        else if (this.memory.role == 'Eupgrade') {
            if (this.memory.working) {
                this.say("upgrade");
                this.upgrade_();
            }
            else {
                let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (source)
                    this.harvest_(source);
                if (this.ticksToLive < 120 && this.store.getUsedCapacity('energy') <= 20)
                    this.suicide();
            }
        }
    }
    handle_dismantle() {
        let missionData = this.memory.MissionData;
        missionData.id;
        let mission = missionData.Data;
        if (mission.boost) ;
        if (this.room.name != mission.disRoom) {
            this.goTo(new RoomPosition(25, 25, mission.disRoom), 20);
            return;
        }
        /* 黄灰旗 */
        let disFlag = this.pos.findClosestByPath(FIND_FLAGS, { filter: (flag) => {
                return flag.color == COLOR_YELLOW && flag.secondaryColor == COLOR_GREY;
            } });
        if (!disFlag) {
            var clostStructure = this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: (struc) => {
                    return !isInArray([STRUCTURE_CONTROLLER, STRUCTURE_WALL], struc.structureType);
                } });
            if (clostStructure) {
                clostStructure.pos.createFlag(generateID(), COLOR_YELLOW, COLOR_GREY);
                return;
            }
            else
                return;
        }
        let stru = disFlag.pos.lookFor(LOOK_STRUCTURES)[0];
        if (stru) {
            if (this.dismantle(stru) == ERR_NOT_IN_RANGE) {
                this.goTo(stru.pos, 1);
                return;
            }
        }
        else {
            disFlag.remove();
        }
    }
    handle_control() {
        let missionData = this.memory.MissionData;
        missionData.id;
        let data = missionData.Data;
        if (this.room.name != data.disRoom || Game.shard.name != data.shard) {
            this.arriveTo(new RoomPosition(24, 24, data.disRoom), 23, data.shard);
        }
        else {
            let control = this.room.controller;
            if (!this.pos.isNearTo(control))
                this.goTo(control.pos, 1);
            else {
                if (control.owner)
                    this.attackController(control);
                else
                    this.reserveController(control);
            }
        }
    }
    // 急速冲级
    handle_quickRush() {
        let missionData = this.memory.MissionData;
        let id = missionData.id;
        let mission = Game.rooms[this.memory.belong].GainMission(id);
        if (!mission)
            return;
        // boost检查
        if (mission.LabBind && !this.BoostCheck(['work']))
            return;
        this.workstate('energy');
        var terminal_ = global.Stru[this.memory.belong]['terminal'];
        if (!terminal_) {
            this.say("找不到terminal!");
            return;
        }
        if (this.memory.working) {
            this.upgrade_();
            if (this.store.getUsedCapacity('energy') < 35 && terminal_.pos.isNearTo(this))
                this.withdraw_(terminal_, 'energy');
        }
        else {
            this.withdraw_(terminal_, 'energy');
        }
        this.memory.standed = mission.Data.standed;
    }
    handle_support() {
        let missionData = this.memory.MissionData;
        missionData.id;
        let data = missionData.Data;
        if (!missionData)
            return;
        var roomName = data.disRoom;
        if (this.room.name == this.memory.belong) {
            if (this.memory.role == 'double-attack') {
                if (!this.BoostCheck(['attack', 'move', 'tough']))
                    return;
            }
            else if (this.memory.role == 'double-heal') {
                if (!this.BoostCheck(['heal', 'move', 'tough']))
                    return;
            }
        }
        if (!this.memory.double) {
            if (this.memory.role == 'double-heal') {
                /* 由heal来进行组队 */
                if (Game.time % 7 == 0) {
                    var disCreep = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (creep) => {
                            return creep.memory.role == 'double-attack' && !creep.memory.double;
                        } });
                    if (disCreep) {
                        this.memory.double = disCreep.name;
                        disCreep.memory.double = this.name;
                        this.memory.captain = false;
                        disCreep.memory.captain = true;
                    }
                }
            }
            return;
        }
        if (this.memory.role == 'double-attack') {
            if (!Game.creeps[this.memory.double])
                return;
            if (this.fatigue || Game.creeps[this.memory.double].fatigue)
                return;
            if (Game.creeps[this.memory.double] && !this.pos.isNearTo(Game.creeps[this.memory.double]) && (!isInArray([0, 49], this.pos.x) && !isInArray([0, 49], this.pos.y)))
                return;
            /* 去目标房间 */
            if (this.room.name != roomName) {
                this.goTo(new RoomPosition(24, 24, roomName), 23);
            }
            else {
                let flag = this.pos.findClosestByRange(FIND_FLAGS, { filter: (flag) => {
                        return flag.color == COLOR_BLUE;
                    } });
                if (flag) {
                    let creeps = this.pos.findInRange(FIND_HOSTILE_CREEPS, 1, { filter: (creep) => {
                            return !isInArray(Memory.whitesheet, creep.owner.username);
                        } });
                    if (creeps[0])
                        this.attack(creeps[0]);
                    this.goTo(flag.pos, 0);
                    return;
                }
                let creeps = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                        return !isInArray(Memory.whitesheet, creep.owner.username);
                    } });
                if (creeps) {
                    if (this.attack(creeps) == ERR_NOT_IN_RANGE)
                        this.goTo(creeps.pos, 1);
                }
            }
        }
        else {
            if (this.memory.role == 'double-heal') {
                this.moveTo(Game.creeps[this.memory.double]);
                if (Game.creeps[this.memory.double])
                    this.heal(Game.creeps[this.memory.double]);
                else
                    this.heal(this);
                if (!Game.creeps[this.memory.double]) {
                    this.suicide();
                    return;
                }
                else {
                    if (this.pos.isNearTo(Game.creeps[this.memory.double])) {
                        var caption_hp = Game.creeps[this.memory.double].hits;
                        var this_hp = this.hits;
                        if (this_hp == this.hitsMax && caption_hp == Game.creeps[this.memory.double].hitsMax)
                            this.heal(Game.creeps[this.memory.double]);
                        if (caption_hp < this_hp) {
                            this.heal(Game.creeps[this.memory.double]);
                        }
                        else {
                            this.heal(this);
                        }
                        let otherCreeps = this.pos.findInRange(FIND_MY_CREEPS, 3, { filter: (creep) => { return creep.hits < creep.hitsMax - 300; } });
                        if (otherCreeps[0] && this.hits == this.hitsMax && Game.creeps[this.memory.double].hits == Game.creeps[this.memory.double].hitsMax) {
                            if (otherCreeps[0].pos.isNearTo(this))
                                this.heal(otherCreeps[0]);
                            else
                                this.rangedHeal(otherCreeps[0]);
                        }
                    }
                    else {
                        this.heal(this);
                        this.moveTo(Game.creeps[this.memory.double]);
                    }
                }
            }
        }
    }
    // 紧急援建
    handle_helpBuild() {
        let missionData = this.memory.MissionData;
        missionData.id;
        let data = missionData.Data;
        if (!missionData)
            return;
        if (this.room.name == this.memory.belong && Game.shard.name == this.memory.shard) {
            if (!this.BoostCheck(['move', 'work', 'heal', 'tough', 'carry']))
                return;
            if (this.store.getUsedCapacity('energy') <= 0) {
                let stroge_ = global.Stru[this.memory.belong]['storage'];
                if (stroge_) {
                    this.withdraw_(stroge_, 'energy');
                    return;
                }
            }
        }
        if ((this.room.name != data.disRoom || Game.shard.name != data.shard) && !this.memory.swith) {
            this.heal(this);
            this.arriveTo(new RoomPosition(24, 24, data.disRoom), 23, data.shard);
        }
        else {
            this.memory.swith = true;
            let runFlag = this.pos.findClosestByRange(FIND_FLAGS, { filter: (flag) => {
                    return flag.color == COLOR_BLUE;
                } });
            if (runFlag) {
                this.goTo(runFlag.pos, 0);
                return;
            }
            this.workstate('energy');
            if (this.memory.working) {
                if (this.room.name != data.disRoom) {
                    this.arriveTo(new RoomPosition(24, 24, data.disRoom), 23, data.shard);
                    return;
                }
                if (this.hits < this.hitsMax) {
                    this.heal(this);
                }
                if (this.room.name != data.disRoom) {
                    this.goTo(new RoomPosition(24, 24, data.disRoom), 23);
                    return;
                }
                let cons = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if (cons)
                    this.build_(cons);
            }
            else {
                // 以withdraw开头的旗帜  例如： withdraw_0
                let withdrawFlag = this.pos.findClosestByPath(FIND_FLAGS, { filter: (flag) => {
                        return flag.name.indexOf('withdraw') == 0;
                    } });
                if (withdrawFlag) {
                    let tank_ = withdrawFlag.pos.GetStructureList(['storage', 'terminal', 'container', 'tower']);
                    if (tank_.length > 0) {
                        this.withdraw_(tank_[0], 'energy');
                        return;
                    }
                }
                let harvestFlag = Game.flags[`${this.memory.belong}/HB/harvest`];
                if (harvestFlag) {
                    if (this.hits < this.hitsMax) {
                        this.heal(this);
                    }
                    if (this.room.name != harvestFlag.pos.roomName) {
                        this.goTo(harvestFlag.pos, 1);
                    }
                    else {
                        let source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                        if (source) {
                            this.harvest_(source);
                        }
                    }
                    return;
                }
                let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (source)
                    this.harvest_(source);
            }
        }
    }
    // 房间签名
    handle_sign() {
        let missionData = this.memory.MissionData;
        let id = missionData.id;
        let data = missionData.Data;
        if (!missionData)
            return;
        if (this.room.name != data.disRoom || Game.shard.name != data.shard) {
            this.arriveTo(new RoomPosition(24, 24, data.disRoom), 23, data.shard);
        }
        else {
            let control = this.room.controller;
            if (control) {
                if (!this.pos.isNearTo(control))
                    this.goTo(control.pos, 1);
                else {
                    this.signController(control, data.str);
                }
                if (control.sign == data.str) {
                    Game.rooms[this.memory.belong].DeleteMission(id);
                }
            }
        }
    }
    // 攻防一体
    handle_aio() {
        let missionData = this.memory.MissionData;
        missionData.id;
        let data = missionData.Data;
        if (!missionData)
            return;
        if (this.room.name == this.memory.belong && Game.shard.name == this.memory.shard) {
            if (!this.BoostCheck(['move', 'heal', 'tough', 'ranged_attack']))
                return;
        }
        if ((this.room.name != data.disRoom || Game.shard.name != data.shard) && !this.memory.swith) {
            this.heal(this);
            this.arriveTo(new RoomPosition(24, 24, data.disRoom), 23, data.shard);
        }
        else {
            var creep_ = this.pos.findInRange(FIND_HOSTILE_CREEPS, 3, { filter: (creep) => {
                    return !isInArray(Memory.whitesheet, creep.owner.username) && !creep.pos.GetStructure('rampart');
                } });
            if (creep_.length > 0)
                if (this.pos.isNearTo(creep_[0])) {
                    this.rangedMassAttack();
                }
                else {
                    this.rangedAttack(creep_[0]);
                }
            // 治疗友军
            let otherCreeps = this.pos.findInRange(FIND_MY_CREEPS, 3, { filter: (creep) => { return creep.hits < creep.hitsMax - 200; } });
            if (otherCreeps[0] && this.hits == this.hitsMax) {
                if (otherCreeps[0].pos.isNearTo(this))
                    this.heal(otherCreeps[0]);
                else {
                    this.rangedHeal(otherCreeps[0]);
                    this.goTo(otherCreeps[0].pos, 1);
                    return;
                }
            }
            else {
                this.heal(this);
            }
            let attack_flag = this.pos.findClosestByPath(FIND_FLAGS, { filter: (flag) => {
                    return flag.name.indexOf('attack') == 0;
                } });
            if (attack_flag) {
                if (attack_flag.pos.GetStructure(STRUCTURE_WALL)) {
                    if (!this.pos.inRangeTo(attack_flag, 3))
                        this.goTo(attack_flag.pos, 3);
                    else
                        this.rangedAttack(attack_flag.pos.GetStructure(STRUCTURE_WALL));
                }
                else {
                    if (!this.pos.isNearTo(attack_flag))
                        this.goTo(attack_flag.pos, 1);
                    else
                        this.rangedMassAttack();
                }
                if (attack_flag.pos.lookFor(LOOK_STRUCTURES).length <= 0)
                    attack_flag.remove();
            }
            else {
                var clostStructure = this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: (struc) => {
                        return !isInArray([STRUCTURE_CONTROLLER, STRUCTURE_RAMPART, STRUCTURE_STORAGE], struc.structureType);
                    } });
                if (clostStructure) {
                    clostStructure.pos.createFlag(`attack_${generateID()}`, COLOR_WHITE);
                    return;
                }
                else {
                    return;
                }
            }
            if (!attack_flag)
                return;
        }
    }
    /* 原矿开采任务处理 */
    handle_mineral() {
        var extractor = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.extractID);
        if (!extractor)
            return;
        var container;
        if (!this.memory.containerID) {
            var con = extractor.pos.findInRange(FIND_STRUCTURES, 1, { filter: (stru) => {
                    return stru.structureType == 'container';
                } });
            if (con.length > 0)
                this.memory.containerID = con[0].id;
            return;
        }
        else {
            container = Game.getObjectById(this.memory.containerID);
            if (!container)
                return;
            /* container杂志清理 */
            if (container.store && container.store.getUsedCapacity() > 0 && this.pos.isEqualTo(container)) {
                for (var i in container.store) {
                    this.withdraw(container, i);
                }
            }
            if (!this.memory.working)
                this.memory.working = false;
            if (this.memory.working && this.store.getFreeCapacity() == this.store.getCapacity())
                this.memory.working = false;
            if (!this.memory.working && this.store.getFreeCapacity() == 0)
                this.memory.working = true;
            if (this.memory.working) {
                var storage_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.storageID);
                if (!storage_)
                    return;
                if (!this.pos.isNearTo(storage_))
                    this.goTo(storage_.pos, 1);
                else {
                    for (var i in this.store) {
                        this.transfer(storage_, i);
                        return;
                    }
                }
            }
            else {
                if (!this.pos.isEqualTo(container.pos)) {
                    this.goTo(container.pos, 0);
                    return;
                }
                else {
                    if (this.ticksToLive < 15)
                        this.suicide();
                    var mineral = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.mineralID);
                    if (!mineral.mineralAmount) {
                        Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                        this.suicide();
                        return;
                    }
                    if (!extractor.cooldown)
                        this.harvest(mineral);
                }
            }
        }
    }
}

/* 爬虫原型拓展   --任务  --任务行为 */
class CreepMissonMineExtension extends Creep {
    /* 外矿开采处理 */
    handle_outmine() {
        var creepMisson = this.memory.MissionData.Data;
        var globalMisson = Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id);
        if (!globalMisson) {
            this.say("找不到全局任务了！");
            this.memory.MissionData = {};
            return;
        }
        if (this.hits < this.hitsMax && globalMisson.Data.state == 2) {
            var enemy = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                    return !isInArray(Memory.whitesheet, creep.owner.username);
                } });
            if (enemy)
                globalMisson.Data.state = 3;
        }
        if (this.memory.role == 'out-claim') {
            if (this.room.name != creepMisson.disRoom && !this.memory.disPos) {
                this.goTo(new RoomPosition(25, 25, creepMisson.disRoom), 20);
                if (this.room.name != this.memory.belong) {
                    /* 如果是别人的房间就不考虑 */
                    if (this.room.controller && this.room.controller.owner && this.room.controller.owner.username != this.owner.username)
                        return;
                    if (Memory.outMineData && Memory.outMineData[this.room.name]) {
                        for (var i of Memory.outMineData[this.room.name].road) {
                            var thisPos = unzipPosition(i);
                            if (thisPos.roomName == this.name && !thisPos.GetStructure('road')) {
                                thisPos.createConstructionSite('road');
                            }
                        }
                    }
                }
            }
            if (!this.memory.disPos && this.room.name == creepMisson.disRoom) {
                var controllerPos = this.room.controller.pos;
                this.memory.disPos = zipPosition(controllerPos);
            }
            if (this.memory.disPos) {
                if (!this.memory.num)
                    this.memory.num = 5000;
                if (this.room.controller.reservation && this.room.controller.reservation.ticksToEnd && this.room.controller.reservation.username == this.owner.username && this.room.controller.reservation.ticksToEnd <= this.memory.num) {
                    var Cores = this.room.find(FIND_STRUCTURES, { filter: (structure) => {
                            return structure.structureType == STRUCTURE_INVADER_CORE;
                        } });
                    if (Cores.length > 0)
                        globalMisson.Data.state = 3;
                }
                if (this.room.controller.reservation && this.room.controller.reservation.ticksToEnd && this.room.controller.reservation.username != this.owner.username) {
                    globalMisson.Data.state = 3;
                }
                if (!this.pos.isNearTo(this.room.controller)) {
                    var controllerPos = unzipPosition(this.memory.disPos);
                    this.goTo(controllerPos, 1);
                }
                else {
                    if (this.room.controller && (!this.room.controller.sign || (Game.time - this.room.controller.sign.time) > 50000)) {
                        this.signController(this.room.controller, `${this.owner.username}'s 🌾🌾🌾 room!  Auto clean, Please keep distance!`);
                    }
                    this.reserveController(this.room.controller);
                    if (Game.time % 91 == 0) {
                        if (Memory.outMineData && Memory.outMineData[this.room.name]) {
                            for (var i of Memory.outMineData[this.room.name].road) {
                                var thisPos = unzipPosition(i);
                                if (thisPos.roomName == this.room.name && !thisPos.GetStructure('road')) {
                                    thisPos.createConstructionSite('road');
                                }
                            }
                        }
                    }
                }
                if (this.room.controller.reservation)
                    this.memory.num = this.room.controller.reservation.ticksToEnd;
            }
        }
        else if (this.memory.role == 'out-harvest') {
            if (!Memory.outMineData[creepMisson.disRoom] || Memory.outMineData[creepMisson.disRoom].minepoint.length <= 0)
                return;
            for (var point of Memory.outMineData[creepMisson.disRoom].minepoint) {
                if (!point.bind)
                    point.bind = {};
                if (!point.bind.harvest && !this.memory.bindpoint) {
                    point.bind.harvest = this.name;
                    this.memory.bindpoint = point.pos;
                }
            }
            if (!this.memory.bindpoint)
                return;
            var disPos = unzipPosition(this.memory.bindpoint);
            var source = disPos.lookFor(LOOK_SOURCES)[0];
            if (!source)
                return;
            this.workstate('energy');
            if (this.memory.working) {
                var container_ = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: (stru) => { return stru.structureType == 'container'; } });
                if (container_[0]) {
                    if (!this.pos.isEqualTo(container_[0].pos))
                        this.goTo(container_[0].pos, 0);
                    else {
                        if (container_[0].hits < container_[0].hitsMax) {
                            this.repair(container_[0]);
                            return;
                        }
                        this.transfer(container_[0], 'energy');
                    }
                    Memory.outMineData[creepMisson.disRoom].car = true;
                }
                else {
                    Memory.outMineData[creepMisson.disRoom].car = false;
                    var constainer_constru = source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1, { filter: (stru) => { return stru.structureType == 'container'; } });
                    if (constainer_constru[0]) {
                        this.build(constainer_constru[0]);
                    }
                    else {
                        this.pos.createConstructionSite('container');
                    }
                }
            }
            else {
                if (!this.pos.isNearTo(disPos))
                    this.goTo(disPos, 1);
                else
                    this.harvest(source);
            }
        }
        else if (this.memory.role == 'out-car') {
            this.workstate('energy');
            if (!Memory.outMineData[creepMisson.disRoom] || Memory.outMineData[creepMisson.disRoom].minepoint.length <= 0)
                return;
            for (var point of Memory.outMineData[creepMisson.disRoom].minepoint) {
                if (!point.bind.car && !this.memory.bindpoint) {
                    point.bind.car = this.name;
                    this.memory.bindpoint = point.pos;
                }
            }
            if (!this.memory.bindpoint)
                return;
            var disPos = unzipPosition(this.memory.bindpoint);
            if (this.memory.working) {
                var stroage_ = global.Stru[this.memory.belong]['storage'];
                if (!stroage_)
                    return;
                if (!this.pos.isNearTo(stroage_)) {
                    var construsions = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, { filter: (constr) => {
                            return constr.structureType == 'road';
                        } });
                    if (construsions) {
                        this.build_(construsions);
                        return;
                    }
                    var road_ = this.pos.GetStructure('road');
                    if (road_ && road_.hits < road_.hitsMax) {
                        this.repair(road_);
                        return;
                    }
                    this.goTo(stroage_.pos, 1);
                }
                else {
                    this.transfer(stroage_, "energy");
                    if (this.ticksToLive < 100)
                        this.suicide();
                }
            }
            else {
                if (!Game.rooms[disPos.roomName]) {
                    this.goTo(disPos, 1);
                    return;
                }
                this.say("🚗", true);
                var container_ = disPos.findInRange(FIND_STRUCTURES, 3, { filter: (stru) => {
                        return stru.structureType == 'container';
                    } });
                if (container_[0] && container_[0].store.getUsedCapacity('energy') >= this.store.getCapacity()) {
                    if (this.withdraw(container_[0], 'energy') == ERR_NOT_IN_RANGE) {
                        this.goTo(container_[0].pos, 1);
                        return;
                    }
                    this.withdraw_(container_[0], 'energy');
                }
                else if (container_[0] && container_[0].store.getUsedCapacity('energy') < this.store.getCapacity()) {
                    this.goTo(container_[0].pos, 1);
                    return;
                }
                else if (!container_[0]) {
                    this.goTo(disPos, 1);
                    return;
                }
            }
        }
        else {
            if (this.hits < this.hitsMax)
                this.heal(this);
            if (this.room.name != creepMisson.disRoom) {
                this.goTo(new RoomPosition(25, 25, creepMisson.disRoom), 20);
            }
            else {
                if (globalMisson.Data.state == 2) {
                    let wounded = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (creep) => {
                            return creep.hits < creep.hitsMax && creep != this;
                        } });
                    if (wounded) {
                        if (!this.pos.isNearTo(wounded))
                            this.goTo(wounded.pos, 1);
                        this.heal(wounded);
                    }
                    return;
                }
                var enemy = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                        return !isInArray(Memory.whitesheet, creep.owner.username);
                    } });
                if (enemy) {
                    if (this.rangedAttack(enemy) == ERR_NOT_IN_RANGE) {
                        this.goTo(enemy.pos, 3);
                    }
                    return;
                }
                var InvaderCore = this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: (stru) => {
                        return stru.structureType != 'rampart';
                    } });
                if (InvaderCore) {
                    this.memory.standed = true;
                    if (!this.pos.isNearTo(InvaderCore))
                        this.goTo(InvaderCore.pos, 1);
                    else
                        this.rangedMassAttack();
                    return;
                }
            }
        }
    }
    /* power采集 */
    handle_power() {
        var creepMisson = this.memory.MissionData.Data;
        var globalMisson = Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id);
        if (!globalMisson) {
            this.say("找不到全局任务了！");
            this.memory.MissionData = {};
            return;
        }
        var role = this.memory.role;
        var missonPostion = new RoomPosition(creepMisson.x, creepMisson.y, creepMisson.room);
        if (!missonPostion) {
            this.say("找不到目标地点！");
            return;
        }
        if (role == 'power-attack') {
            this.memory.standed = true;
            if (globalMisson.Data.state == 1) {
                /* 先组队 */
                if (!this.memory.double) {
                    if (Game.time % 7 == 0) {
                        if (globalMisson.CreepBind['power-heal'].bind.length > 0) {
                            for (var c of globalMisson.CreepBind['power-heal'].bind) {
                                if (Game.creeps[c] && Game.creeps[c].pos.roomName == this.room.name && !Game.creeps[c].memory.double) {
                                    var disCreep = Game.creeps[c];
                                    disCreep.memory.double = this.name;
                                    this.memory.double = disCreep.name;
                                }
                            }
                        }
                    }
                    return;
                }
                /* 附件没有治疗虫就等 */
                if (!Game.creeps[this.memory.double]) {
                    this.suicide();
                    return;
                }
                if (Game.creeps[this.memory.double] && !this.pos.isNearTo(Game.creeps[this.memory.double]) && (!isInArray([0, 49], this.pos.x) && !isInArray([0, 49], this.pos.y)))
                    return;
                if (this.fatigue || Game.creeps[this.memory.double].fatigue)
                    return;
                /* 先寻找powerbank周围的空点，并寻找空点上有没有人 */
                if (!this.pos.isNearTo(missonPostion)) {
                    if (!Game.rooms[missonPostion.roomName]) {
                        this.goTo(missonPostion, 1);
                        return;
                    }
                    var harvest_void = missonPostion.getSourceVoid();
                    var active_void = [];
                    for (var v of harvest_void) {
                        var creep_ = v.lookFor(LOOK_CREEPS);
                        if (creep_.length <= 0)
                            active_void.push(v);
                    }
                    if (active_void.length > 0) {
                        this.goTo(missonPostion, 1);
                    }
                    else {
                        if (!missonPostion.inRangeTo(this.pos.x, this.pos.y, 3))
                            this.goTo(missonPostion, 3);
                        else {
                            if (Game.time % 10 == 0) {
                                var enemy_creep = powerbank_.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                                var powerbank_ = missonPostion.GetStructure('powerBank');
                                if (enemy_creep.length > 0 && powerbank_ && powerbank_.hits < 600000) {
                                    globalMisson.Data.state = 2;
                                }
                            }
                        }
                    }
                }
                else {
                    /* 这是被攻击了 */
                    if (this.hits < 1500) {
                        /* 被攻击停止所有爬虫生产 */
                        globalMisson.CreepBind['power-attack'].num = 0;
                        globalMisson.CreepBind['power-heal'].num = 0;
                        let hostileCreep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        Game.notify(`[warning] 采集爬虫小队${this.name}遭受${hostileCreep ? hostileCreep.owner.username : "不明"}攻击，地点在${this.room.name}！已经停止该power爬虫孵化！`);
                        return;
                    }
                    if (!this.memory.tick)
                        this.memory.tick = this.ticksToLive;
                    var powerbank_ = missonPostion.GetStructure('powerBank');
                    if (powerbank_) {
                        this.attack(powerbank_);
                        if ((powerbank_.hits / 600) + 30 > this.ticksToLive) // 快没有生命了就增加爬虫数量，以方便继续采集
                         {
                            /* 填充完毕就这么干 */
                            if (globalMisson.CreepBind['power-attack'].num == 2 && globalMisson.CreepBind['power-attack'].num == globalMisson.CreepBind['power-attack'].bind.length && globalMisson.CreepBind['power-heal'].num == globalMisson.CreepBind['power-heal'].bind.length) {
                                globalMisson.CreepBind['power-attack'].num = 1;
                                globalMisson.CreepBind['power-heal'].num = 1;
                                if (globalMisson.CreepBind['power-attack'].bind.length < 2)
                                    return;
                            }
                            else {
                                if (this.ticksToLive < (1500 - this.memory.tick + 200)) {
                                    globalMisson.CreepBind['power-attack'].num = 2;
                                    globalMisson.CreepBind['power-heal'].num = 2;
                                }
                            }
                            /* 新增一层逻辑判断 */
                            if (this.ticksToLive < 40) {
                                globalMisson.CreepBind['power-attack'].num = 1;
                                globalMisson.CreepBind['power-heal'].num = 1;
                            }
                        }
                        var enemy_creep = powerbank_.pos.findInRange(FIND_HOSTILE_CREEPS, 2);
                        if (enemy_creep.length == 0 && powerbank_.hits < 280000) {
                            globalMisson.Data.state = 2;
                        }
                        else if (enemy_creep.length > 0 && powerbank_.hits < 550000) {
                            globalMisson.Data.state = 2;
                        }
                    }
                    else {
                        /* 说明过期了，删除任务，自杀 */
                        for (var ii in globalMisson.CreepBind)
                            for (var jj of globalMisson.CreepBind[ii].bind)
                                Game.creeps[jj].suicide();
                        Game.rooms[this.memory.belong].DeleteMission(globalMisson.id);
                    }
                }
            }
            else {
                if (!this.pos.isNearTo(missonPostion)) {
                    this.goTo(missonPostion, 1);
                    return;
                }
                /* 没有powerbank说明已经打掉了 */
                var powerbank_ = missonPostion.GetStructure('powerBank');
                if (!powerbank_)
                    this.suicide();
                else
                    this.attack(powerbank_);
            }
        }
        else if (role == 'power-heal') {
            if (!this.memory.double)
                return;
            if (Game.creeps[this.memory.double]) {
                if (this.hits < this.hitsMax) {
                    this.heal(this);
                    return;
                }
                if (Game.creeps[this.memory.double].hits < Game.creeps[this.memory.double].hitsMax) {
                    this.heal(Game.creeps[this.memory.double]);
                }
                if (!this.pos.inRangeTo(missonPostion, 3)) {
                    this.memory.standed = false;
                    if (this.room.name == this.memory.belong)
                        this.goTo(Game.creeps[this.memory.double].pos, 0);
                    else
                        this.moveTo(Game.creeps[this.memory.double].pos);
                }
                else {
                    this.memory.standed = true;
                    if (!this.pos.isNearTo(Game.creeps[this.memory.double]))
                        this.goTo(Game.creeps[this.memory.double].pos, 1);
                }
            }
            else {
                this.suicide();
            }
        }
        else if (role == 'power-carry') {
            this.workstate('power');
            if (!this.memory.working) {
                if (!this.pos.inRangeTo(missonPostion, 5)) {
                    this.goTo(missonPostion, 5);
                }
                else {
                    /* 寻找powerbank */
                    var powerbank_ = missonPostion.GetStructure('powerBank');
                    if (powerbank_) {
                        this.goTo(missonPostion, 4);
                        if (!this.memory.standed)
                            this.memory.standed = true;
                    }
                    else {
                        /* 寻找掉落资源 */
                        /* 优先寻找ruin */
                        var ruins = missonPostion.lookFor(LOOK_RUINS);
                        if (ruins.length > 0 && ruins[0].store.getUsedCapacity('power') > 0) {
                            if (this.memory.standed)
                                this.memory.standed = false;
                            if (!this.pos.isNearTo(ruins[0]))
                                this.goTo(ruins[0].pos, 1);
                            else
                                this.withdraw(ruins[0], 'power');
                            return;
                        }
                        var drop_power = missonPostion.lookFor(LOOK_RESOURCES);
                        if (drop_power.length > 0) {
                            for (var i of drop_power) {
                                if (i.resourceType == 'power') {
                                    if (this.memory.standed)
                                        this.memory.standed = true;
                                    if (!this.pos.isNearTo(i))
                                        this.goTo(i.pos, 1);
                                    else
                                        this.pickup(i);
                                    return;
                                }
                            }
                        }
                        /* 说明没有资源了 */
                        if (this.store.getUsedCapacity('power') > 0)
                            this.memory.working = true;
                        if (ruins.length <= 0 && drop_power.length <= 0 && this.store.getUsedCapacity('power') <= 0) {
                            this.suicide();
                        }
                    }
                }
            }
            else {
                var storage_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.storageID);
                if (!storage_)
                    return;
                if (!this.pos.isNearTo(storage_))
                    this.goTo(storage_.pos, 1);
                else {
                    this.transfer(storage_, 'power');
                    this.suicide();
                }
            }
        }
    }
    /* deposit采集任务处理 */
    handle_deposit() {
        var creepMisson = this.memory.MissionData.Data;
        if (!Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id)) {
            this.memory.MissionData = {};
            return;
        }
        if (!creepMisson)
            return;
        /* 判断是否正在遭受攻击 */
        if (this.hits < this.hitsMax / 2) {
            let hcreep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            Game.notify(`来自${this.memory.belong}的商品爬虫遭受攻击,攻击者疑似为${hcreep ? hcreep.owner.username : "不明生物"}`);
        }
        this.workstate(creepMisson.rType);
        if (this.memory.working) {
            var storage_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.storageID);
            if (!storage_)
                return;
            if (!this.pos.isNearTo(storage_))
                this.goTo(storage_.pos, 1);
            else {
                this.transfer(storage_, creepMisson.rType);
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                this.suicide();
            }
        }
        else {
            var missonPostion = new RoomPosition(creepMisson.x, creepMisson.y, creepMisson.room);
            if (!missonPostion) {
                this.say("找不到目标地点！");
                return;
            }
            if (!this.pos.isNearTo(missonPostion)) {
                if (!Game.rooms[missonPostion.roomName]) {
                    this.goTo(missonPostion, 1);
                    return;
                }
                var harvest_void = missonPostion.getSourceVoid();
                var active_void = [];
                for (var v of harvest_void) {
                    var creep_ = v.lookFor(LOOK_CREEPS);
                    if (creep_.length <= 0)
                        active_void.push(v);
                }
                if (active_void.length > 0) {
                    this.goTo(missonPostion, 1);
                }
                else {
                    if (!missonPostion.inRangeTo(this.pos.x, this.pos.y, 3))
                        this.goTo(missonPostion, 3);
                }
            }
            else {
                if (!this.memory.tick)
                    this.memory.tick = this.ticksToLive;
                if (this.ticksToLive < (1500 - (this.memory.tick ? this.memory.tick : 1000) + 70) && this.store.getUsedCapacity(creepMisson.rType) > 0) {
                    this.memory.working = true;
                }
                /* 开始采集 */
                var deposit_ = missonPostion.lookFor(LOOK_DEPOSITS)[0];
                if (deposit_) {
                    if (!deposit_.cooldown) {
                        this.harvest(deposit_);
                    }
                }
                else {
                    Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                    return;
                }
            }
        }
    }
}

class CreepMissonWarExtension extends Creep {
    // 红球防御
    handle_defend_attack() {
        if (!this.BoostCheck(['move', 'attack']))
            return;
        this.memory.standed = true;
        if (this.hitsMax - this.hits > 200)
            this.optTower('heal', this);
        this.memory.crossLevel = 16;
        /* 如果周围1格发现敌人，爬虫联合防御塔攻击 */
        var nearCreep = this.pos.findInRange(FIND_HOSTILE_CREEPS, 1, { filter: (creep) => {
                return !isInArray(Memory.whitesheet, creep.name);
            } });
        if (nearCreep.length > 0) {
            this.attack(nearCreep[0]);
            this.optTower('attack', nearCreep[0]);
        }
        /* 寻路去距离敌对爬虫最近的rampart */
        var hostileCreep = Game.rooms[this.memory.belong].find(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                return !isInArray(Memory.whitesheet, creep.name);
            } });
        if (hostileCreep.length > 0) {
            for (var c of hostileCreep)
                /* 如果发现Hits/hitsMax低于百分之80的爬虫，直接防御塔攻击 */
                if (c.hits / c.hitsMax <= 0.8)
                    this.optTower('attack', c);
        }
        else
            return;
        // 以gather_attack开头的旗帜  例如： defend_attack_0 优先前往该旗帜附近
        let gatherFlag = this.pos.findClosestByPath(FIND_FLAGS, { filter: (flag) => {
                return flag.name.indexOf('defend_attack') == 0;
            } });
        if (gatherFlag) {
            this.goTo(gatherFlag.pos, 0);
            return;
        }
        if (!Game.rooms[this.memory.belong].memory.enemy[this.name])
            Game.rooms[this.memory.belong].memory.enemy[this.name] = [];
        if (Game.rooms[this.memory.belong].memory.enemy[this.name].length <= 0) {
            /* 领取敌对爬虫 */
            let creeps_ = [];
            for (var creep of hostileCreep) {
                /* 判断一下该爬虫的id是否存在于其他爬虫的分配里了 */
                if (this.isInDefend(creep))
                    continue;
                else {
                    creeps_.push(creep);
                }
            }
            if (creeps_.length > 0) {
                let highestAim = creeps_[0];
                for (var i of creeps_) {
                    if (parts(i, 'attack') || parts(i, 'work')) {
                        highestAim = i;
                        break;
                    }
                }
                Game.rooms[this.memory.belong].memory.enemy[this.name].push(highestAim.id);
                /* 方便识别小队，把周围的爬也放进去 【如果本来不是小队但暂时在周围的，后续爬虫会自动更新】 */
                let nearHCreep = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, { filter: (creep) => {
                        return !isInArray(Memory.whitesheet, creep.name) && !this.isInDefend(creep);
                    } });
                if (nearHCreep.length > 0)
                    for (var n of nearHCreep)
                        Game.rooms[this.memory.belong].memory.enemy[this.name].push(n.id);
            }
        }
        else {
            let en = Game.getObjectById(Game.rooms[this.memory.belong].memory.enemy[this.name][0]);
            if (!en) {
                Game.rooms[this.memory.belong].memory.enemy[this.name].splice(0, 1);
                return;
            }
            let nstC = en;
            // 查找是否是小队爬, 发现不是小队爬就删除
            if (Game.rooms[this.memory.belong].memory.enemy[this.name].length > 1) {
                B: for (var id of Game.rooms[this.memory.belong].memory.enemy[this.name]) {
                    let idCreep = Game.getObjectById(id);
                    if (!idCreep)
                        continue B;
                    if (Game.time % 10 == 0) // 防止敌方爬虫bug
                        if (Math.abs(idCreep.pos.x - en.pos.x) >= 2 || Math.abs(idCreep.pos.y - en.pos.y) >= 2) {
                            let index = Game.rooms[this.memory.belong].memory.enemy[this.name].indexOf(id);
                            Game.rooms[this.memory.belong].memory.enemy[this.name].splice(index, 1);
                            continue B;
                        }
                    if (getDistance(this.pos, idCreep.pos) < getDistance(this.pos, nstC.pos))
                        nstC = idCreep;
                }
            }
            if (nstC) {
                // 寻找最近的爬距离最近的rampart,去那里呆着
                var nearstram = nstC.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == 'rampart' && stru.pos.GetStructureList(['extension', 'link', 'observer', 'tower', 'controller', 'extractor']).length <= 0 && (stru.pos.lookFor(LOOK_CREEPS).length <= 0 || stru.pos.lookFor(LOOK_CREEPS)[0] == this);
                    } });
                if (nearstram)
                    this.goTo_defend(nearstram.pos, 0);
                else
                    this.moveTo(nstC.pos);
            }
        }
        // 仍然没有说明主动防御已经饱和
        if (Game.rooms[this.memory.belong].memory.enemy[this.name].length <= 0) {
            this.say("🔍");
            var closestCreep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                    return !isInArray(Memory.whitesheet, creep.name);
                } });
            if (closestCreep && !this.pos.inRangeTo(closestCreep.pos, 3)) {
                /* 找离虫子最近的rampart */
                var nearstram = closestCreep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == 'rampart' && stru.pos.GetStructureList(['extension', 'link', 'observer', 'tower', 'controller', 'extractor']).length <= 0 && (stru.pos.lookFor(LOOK_CREEPS).length <= 0 || stru.pos.lookFor(LOOK_CREEPS)[0] == this);
                    } });
                this.goTo_defend(nearstram.pos, 0);
            }
        }
        if (this.pos.x >= 48 || this.pos.x <= 1 || this.pos.y >= 48 || this.pos.y <= 1) {
            this.moveTo(new RoomPosition(Memory.RoomControlData[this.memory.belong].center[0], Memory.RoomControlData[this.memory.belong].center[1], this.memory.belong));
        }
    }
    // 蓝球防御
    handle_defend_range() {
        if (!this.BoostCheck(['move', 'ranged_attack']))
            return;
        this.memory.crossLevel = 15;
        if (this.hitsMax - this.hits > 200)
            this.optTower('heal', this);
        /* 如果周围1格发现敌人，爬虫联合防御塔攻击 */
        var nearCreep = this.pos.findInRange(FIND_HOSTILE_CREEPS, 3, { filter: (creep) => {
                return !isInArray(Memory.whitesheet, creep.name);
            } });
        if (nearCreep.length > 0) {
            var nearstCreep = this.pos.findInRange(FIND_HOSTILE_CREEPS, 1, { filter: (creep) => {
                    return !isInArray(Memory.whitesheet, creep.name);
                } });
            if (nearstCreep.length > 0)
                this.rangedMassAttack();
            else
                this.rangedAttack(nearCreep[0]);
            if (Game.time % 4 == 0)
                this.optTower('attack', nearCreep[0]);
        }
        /* 寻路去距离敌对爬虫最近的rampart */
        var hostileCreep = Game.rooms[this.memory.belong].find(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                return !isInArray(Memory.whitesheet, creep.name);
            } });
        if (hostileCreep.length > 0) {
            for (var c of hostileCreep)
                /* 如果发现Hits/hitsMax低于百分之80的爬虫，直接防御塔攻击 */
                if (c.hits / c.hitsMax <= 0.8)
                    this.optTower('attack', c);
        }
        // 以gather_attack开头的旗帜  例如： defend_range_0 优先前往该旗帜附近
        let gatherFlag = this.pos.findClosestByPath(FIND_FLAGS, { filter: (flag) => {
                return flag.name.indexOf('defend_range') == 0;
            } });
        if (gatherFlag) {
            this.goTo(gatherFlag.pos, 0);
            return;
        }
        if (!Game.rooms[this.memory.belong].memory.enemy[this.name])
            Game.rooms[this.memory.belong].memory.enemy[this.name] = [];
        if (Game.rooms[this.memory.belong].memory.enemy[this.name].length <= 0) {
            /* 领取敌对爬虫 */
            let creeps_ = [];
            for (var creep of hostileCreep) {
                /* 判断一下该爬虫的id是否存在于其他爬虫的分配里了 */
                if (this.isInDefend(creep))
                    continue;
                else {
                    creeps_.push(creep);
                }
            }
            if (creeps_.length > 0) {
                let highestAim = creeps_[0];
                for (var i of creeps_) {
                    if (parts(i, 'ranged_attack')) {
                        highestAim = i;
                        break;
                    }
                }
                Game.rooms[this.memory.belong].memory.enemy[this.name].push(highestAim.id);
                /* 方便识别小队，把周围的爬也放进去 【如果本来不是小队但暂时在周围的，后续爬虫会自动更新】 */
                let nearHCreep = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, { filter: (creep) => {
                        return !isInArray(Memory.whitesheet, creep.name) && !this.isInDefend(creep);
                    } });
                if (nearHCreep.length > 0)
                    for (var n of nearHCreep)
                        Game.rooms[this.memory.belong].memory.enemy[this.name].push(n.id);
            }
        }
        else {
            let en = Game.getObjectById(Game.rooms[this.memory.belong].memory.enemy[this.name][0]);
            if (!en) {
                Game.rooms[this.memory.belong].memory.enemy[this.name].splice(0, 1);
                return;
            }
            let nstC = en;
            // 查找是否是小队爬, 发现不是小队爬就删除
            if (Game.rooms[this.memory.belong].memory.enemy[this.name].length > 1) {
                B: for (var id of Game.rooms[this.memory.belong].memory.enemy[this.name]) {
                    let idCreep = Game.getObjectById(id);
                    if (!idCreep)
                        continue B;
                    if (Game.time % 10 == 0)
                        if (Math.abs(idCreep.pos.x - en.pos.x) >= 2 || Math.abs(idCreep.pos.y - en.pos.y) >= 2) {
                            let index = Game.rooms[this.memory.belong].memory.enemy[this.name].indexOf(id);
                            Game.rooms[this.memory.belong].memory.enemy[this.name].splice(index, 1);
                            continue B;
                        }
                    if (getDistance(this.pos, idCreep.pos) < getDistance(this.pos, nstC.pos))
                        nstC = idCreep;
                }
            }
            if (nstC) {
                // 寻找最近的爬距离最近的rampart,去那里呆着
                var nearstram = nstC.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == 'rampart' && stru.pos.GetStructureList(['extension', 'link', 'observer', 'tower', 'controller', 'extractor']).length <= 0 && (stru.pos.lookFor(LOOK_CREEPS).length <= 0 || stru.pos.lookFor(LOOK_CREEPS)[0] == this);
                    } });
                if (nearstram)
                    this.goTo_defend(nearstram.pos, 0);
                else
                    this.moveTo(nstC.pos);
            }
        }
        // 仍然没有说明主动防御已经饱和
        if (Game.rooms[this.memory.belong].memory.enemy[this.name].length <= 0) {
            this.say("🔍");
            var closestCreep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                    return !isInArray(Memory.whitesheet, creep.name);
                } });
            if (closestCreep && !this.pos.inRangeTo(closestCreep.pos, 3)) {
                /* 找离虫子最近的rampart */
                var nearstram = closestCreep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == 'rampart' && stru.pos.GetStructureList(['extension', 'link', 'observer', 'tower', 'controller', 'extractor']).length <= 0 && (stru.pos.lookFor(LOOK_CREEPS).length <= 0 || stru.pos.lookFor(LOOK_CREEPS)[0] == this);
                    } });
                this.goTo_defend(nearstram.pos, 0);
            }
        }
        if (this.pos.x >= 48 || this.pos.x <= 1 || this.pos.y >= 48 || this.pos.y <= 1) {
            this.moveTo(new RoomPosition(Memory.RoomControlData[this.memory.belong].center[0], Memory.RoomControlData[this.memory.belong].center[1], this.memory.belong));
        }
    }
    // 双人防御
    handle_defend_double() {
        if (this.memory.role == 'defend-douAttack') {
            if (!this.BoostCheck(['move', 'attack', 'tough']))
                return;
        }
        else {
            if (!this.BoostCheck(['move', 'heal', 'tough']))
                return;
        }
        if (!this.memory.double) {
            if (this.memory.role == 'double-heal') {
                /* 由heal来进行组队 */
                if (Game.time % 7 == 0) {
                    var disCreep = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (creep) => {
                            return creep.memory.role == 'double-attack' && !creep.memory.double;
                        } });
                    if (disCreep) {
                        this.memory.double = disCreep.name;
                        disCreep.memory.double = this.name;
                        this.memory.captain = false;
                        disCreep.memory.captain = true;
                    }
                }
            }
            return;
        }
        if (this.memory.role == 'defend-douAttack') {
            if (this.hitsMax - this.hits > 1200)
                this.optTower('heal', this);
            if (!Game.creeps[this.memory.double])
                return;
            if (this.fatigue || Game.creeps[this.memory.double].fatigue)
                return;
            if (Game.creeps[this.memory.double] && !this.pos.isNearTo(Game.creeps[this.memory.double]) && (!isInArray([0, 49], this.pos.x) && !isInArray([0, 49], this.pos.y)))
                return;
            /* 去目标房间 */
            if (this.room.name != this.memory.belong) {
                this.goTo(new RoomPosition(24, 24, this.memory.belong), 23);
            }
            else {
                let flag = this.pos.findClosestByPath(FIND_FLAGS, { filter: (flag) => {
                        return flag.name.indexOf('defend_double') == 0;
                    } });
                if (flag) {
                    let creeps = this.pos.findInRange(FIND_HOSTILE_CREEPS, 1, { filter: (creep) => {
                            return !isInArray(Memory.whitesheet, creep.owner.username);
                        } });
                    if (creeps[0])
                        this.attack(creeps[0]);
                    this.goTo(flag.pos, 0);
                    return;
                }
                let creeps = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                        return !isInArray(Memory.whitesheet, creep.owner.username);
                    } });
                if (creeps && !isInArray([0, 49], creeps.pos.x) && !isInArray([0, 49], creeps.pos.y)) {
                    if (this.attack(creeps) == ERR_NOT_IN_RANGE)
                        this.goTo(creeps.pos, 1);
                }
                if (this.pos.x >= 48 || this.pos.x <= 1 || this.pos.y >= 48 || this.pos.y <= 1) {
                    this.moveTo(new RoomPosition(Memory.RoomControlData[this.memory.belong].center[0], Memory.RoomControlData[this.memory.belong].center[1], this.memory.belong));
                }
            }
        }
        else {
            if (this.hitsMax - this.hits > 600)
                this.optTower('heal', this);
            this.moveTo(Game.creeps[this.memory.double]);
            if (Game.creeps[this.memory.double])
                this.heal(Game.creeps[this.memory.double]);
            else
                this.heal(this);
            if (!Game.creeps[this.memory.double]) {
                this.suicide();
                return;
            }
            else {
                if (this.pos.isNearTo(Game.creeps[this.memory.double])) {
                    var caption_hp = Game.creeps[this.memory.double].hits;
                    var this_hp = this.hits;
                    if (this_hp == this.hitsMax && caption_hp == Game.creeps[this.memory.double].hitsMax)
                        this.heal(Game.creeps[this.memory.double]);
                    if (caption_hp < this_hp) {
                        this.heal(Game.creeps[this.memory.double]);
                    }
                    else {
                        this.heal(this);
                    }
                    let otherCreeps = this.pos.findInRange(FIND_MY_CREEPS, 3, { filter: (creep) => { return creep.hits < creep.hitsMax - 300; } });
                    if (otherCreeps[0] && this.hits == this.hitsMax && Game.creeps[this.memory.double].hits == Game.creeps[this.memory.double].hitsMax) {
                        if (otherCreeps[0].pos.isNearTo(this))
                            this.heal(otherCreeps[0]);
                        else
                            this.rangedHeal(otherCreeps[0]);
                    }
                }
                else {
                    this.heal(this);
                    this.moveTo(Game.creeps[this.memory.double]);
                }
            }
        }
    }
    handle_task_squard() {
        var misson = this.memory.MissionData.Data;
        var shard = misson.shard;
        var roomName = misson.disRoom;
        var squadID = misson.squadID;
        if (this.memory.controlledBySquardFrame) {
            /* 说明到达指定房间，并到达合适位置了 */
            /* 添加战争框架控制信息 */
            if (!Memory.squadMemory)
                Memory.squadMemory = {};
            if (!squadID) {
                this.say("找不到squardID!");
                return;
            }
            if (!Memory.squadMemory[squadID]) {
                Memory.squadMemory[squadID] = {
                    creepData: this.memory.squad,
                    sourceRoom: this.memory.belong,
                    presentRoom: this.room.name,
                    disRoom: misson.disRoom,
                    ready: false,
                    array: 'free',
                    sourceShard: this.memory.shard,
                    disShard: this.memory.targetShard,
                    squardType: misson.flag
                };
            }
            /* 赋予全局Memory记忆后，即可交由全局四人小队框架控制 */
            return;
        }
        else {
            /* 任务开始前准备 */
            if (this.room.name == this.memory.belong && this.memory.shard == Game.shard.name) {
                var thisRoom = Game.rooms[this.memory.belong];
                /* boost检查 */
                if (this.getActiveBodyparts('move') > 0) {
                    if (!this.BoostCheck([, 'move']))
                        return;
                }
                if (this.getActiveBodyparts('heal') > 0) {
                    if (!this.BoostCheck([, 'heal']))
                        return;
                }
                if (this.getActiveBodyparts('work') > 0) {
                    if (!this.BoostCheck([, 'work']))
                        return;
                }
                if (this.getActiveBodyparts('attack') > 0) {
                    if (!this.BoostCheck([, 'attack']))
                        return;
                }
                if (this.getActiveBodyparts('ranged_attack') > 0) {
                    if (!this.BoostCheck([, 'ranged_attack']))
                        return;
                }
                if (this.getActiveBodyparts('tough') > 0) {
                    if (!this.BoostCheck([, 'tough']))
                        return;
                }
                /* 组队检查 */
                if (!squadID)
                    return;
                if (!this.memory.MissionData.id)
                    return;
                if (!thisRoom.memory.squadData)
                    Game.rooms[this.memory.belong].memory.squadData = {};
                var MissonSquardData = thisRoom.memory.squadData[squadID];
                if (!MissonSquardData)
                    thisRoom.memory.squadData[squadID] = {};
                if (!MissonSquardData)
                    return;
                if (this.memory.creepType == 'heal') {
                    if (this.memory.role == 'x-aio') {
                        if (Object.keys(MissonSquardData).length <= 0)
                            MissonSquardData[this.name] = { position: '↙', index: 1, role: this.memory.role, creepType: this.memory.creepType };
                        if (Object.keys(MissonSquardData).length == 1 && !isInArray(Object.keys(MissonSquardData), this.name))
                            MissonSquardData[this.name] = { position: '↖', index: 0, role: this.memory.role, creepType: this.memory.creepType };
                        if (Object.keys(MissonSquardData).length == 2 && !isInArray(Object.keys(MissonSquardData), this.name))
                            MissonSquardData[this.name] = { position: '↘', index: 3, role: this.memory.role, creepType: this.memory.creepType };
                        if (Object.keys(MissonSquardData).length == 3 && !isInArray(Object.keys(MissonSquardData), this.name))
                            MissonSquardData[this.name] = { position: '↗', index: 2, role: this.memory.role, creepType: this.memory.creepType };
                    }
                    else {
                        if (Object.keys(MissonSquardData).length <= 0)
                            MissonSquardData[this.name] = { position: '↙', index: 1, role: this.memory.role, creepType: this.memory.creepType };
                        if (Object.keys(MissonSquardData).length == 2 && !isInArray(Object.keys(MissonSquardData), this.name))
                            MissonSquardData[this.name] = { position: '↘', index: 3, role: this.memory.role, creepType: this.memory.creepType };
                    }
                }
                else if (this.memory.creepType == 'attack') {
                    if (Object.keys(MissonSquardData).length == 1 && !isInArray(Object.keys(MissonSquardData), this.name))
                        MissonSquardData[this.name] = { position: '↖', index: 0, role: this.memory.role, creepType: this.memory.creepType };
                    if (Object.keys(MissonSquardData).length == 3 && !isInArray(Object.keys(MissonSquardData), this.name))
                        MissonSquardData[this.name] = { position: '↗', index: 2, role: this.memory.role, creepType: this.memory.creepType };
                }
                if (Object.keys(thisRoom.memory.squadData[squadID]).length == 4 && !this.memory.squad) {
                    console.log(this.name, '添加squard记忆');
                    this.memory.squad = thisRoom.memory.squadData[squadID];
                    return;
                }
                /* 朝前面的爬移动 */
                if (!this.memory.squad)
                    return;
                /* 检查是否所有爬虫都赋予记忆了 */
                for (var mem in this.memory.squad) {
                    if (!Game.creeps[mem])
                        return;
                    if (!Game.creeps[mem].memory.squad)
                        return;
                }
            }
            /* 到达任务房间前自卫 */
            if (this.getActiveBodyparts('ranged_attack')) {
                var enemy = this.pos.findInRange(FIND_HOSTILE_CREEPS, 3, { filter: (creep) => {
                        return !isInArray(Memory.whitesheet, creep.owner.username);
                    } });
                if (enemy[0])
                    this.rangedAttack(enemy[0]);
            }
            if (this.getActiveBodyparts('heal')) {
                var bol = true;
                for (var i in this.memory.squad) {
                    if (Game.creeps[i] && Game.creeps[i].hits < Game.creeps[i].hitsMax && this.pos.isNearTo(Game.creeps[i])) {
                        bol = false;
                        this.heal(Game.creeps[i]);
                    }
                }
                if (bol)
                    this.heal(this);
            }
            /* 线性队列行走规则设定 */
            for (var cc in this.memory.squad) {
                if (Game.creeps[cc] && Game.creeps[cc].fatigue)
                    return;
            }
            if (this.memory.squad[this.name].index != 3 && (!isInArray([0, 49], this.pos.x) && !isInArray([0, 49], this.pos.y))) {
                var followCreepName = findNextData(this);
                if (followCreepName == null)
                    return;
                var portal = this.pos.findClosestByRange(FIND_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == 'portal';
                    } });
                var followCreep = Game.creeps[followCreepName];
                if (!followCreep && portal) {
                    return;
                }
                if (followCreep) {
                    // 跟随爬不靠在一起就等一等
                    if (!this.pos.isNearTo(followCreep))
                        return;
                }
            }
            if (this.memory.squad[this.name].index != 0) {
                var disCreepName = findFollowData(this);
                var portal = this.pos.findClosestByRange(FIND_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == 'portal';
                    } });
                if (disCreepName == null || (!Game.creeps[disCreepName] && !portal))
                    return;
                if (!Game.creeps[disCreepName] && portal) {
                    this.arriveTo(new RoomPosition(25, 25, roomName), 20, shard);
                    return;
                }
                if (Game.shard.name == shard && !Game.creeps[disCreepName])
                    return;
                var disCreep = Game.creeps[disCreepName];
                if (this.room.name == this.memory.belong)
                    this.goTo(disCreep.pos, 0);
                else
                    this.moveTo(disCreep, { ignoreCreeps: true });
            }
            /* 判断在不在目标房间入口房间 */
            if (identifyNext(this.room.name, roomName) == false) {
                if (this.memory.squad[this.name].index == 0)
                    this.arriveTo(new RoomPosition(25, 25, roomName), 20, shard);
            }
            else {
                if (this.memory.squad[this.name].index == 0) {
                    this.say('🔪', true);
                    if (!this.memory.arrived) {
                        var blueFlag = this.pos.findClosestByRange(FIND_FLAGS, { filter: (flag) => {
                                return flag.color == COLOR_BLUE;
                            } });
                        if (blueFlag)
                            this.arriveTo(blueFlag.pos, 5, shard);
                        else
                            this.arriveTo(new RoomPosition(25, 25, this.room.name), 10, shard);
                        /* 寻找周围有没有空地 */
                        if (identifyGarrison(this) && shard == Game.shard.name) {
                            this.memory.arrived = true;
                            return;
                        }
                    }
                    else {
                        // 到达了的逻辑
                        for (var crp in this.memory.squad) {
                            if (Game.creeps[crp])
                                Game.creeps[crp].memory.controlledBySquardFrame = true;
                        }
                    }
                }
            }
        }
    }
}

// 定义好挂载顺序
const plugins$4 = [
    CreepMoveExtension,
    CreepFunctionExtension,
    CreepMissonBaseExtension,
    CreepMissonTransportExtension,
    CreepMissonActionExtension,
    CreepMissonMineExtension,
    CreepMissonWarExtension,
];
/**
* 依次挂载所有的拓展
*/
var mountCreep = () => plugins$4.forEach(plugin => assignPrototype(Creep, plugin));

/* 位置原型拓展   --方法  --寻找 */
class PositionFunctionFindExtension extends RoomPosition {
    /* 获取指定范围内，指定列表类型建筑 范围 模式 0 代表无筛选，1代表hit受损的 2代表hit最小 */
    getRangedStructure(sr, range, mode) {
        let resultstructure;
        switch (mode) {
            case 0: {
                // 无筛选
                resultstructure = this.findInRange(FIND_STRUCTURES, range, { filter: (structure) => {
                        return filter_structure(structure, sr);
                    } });
                return resultstructure;
            }
            case 1: {
                // 筛选hit
                resultstructure = this.findInRange(FIND_STRUCTURES, range, { filter: (structure) => {
                        return filter_structure(structure, sr) && structure.hits < structure.hitsMax;
                    } });
                return resultstructure;
            }
            case 2: {
                resultstructure = this.findInRange(FIND_STRUCTURES, range, { filter: (structure) => {
                        return filter_structure(structure, sr) && structure.hits < structure.hitsMax;
                    } });
                var s_l = LeastHit(resultstructure, 2);
                return s_l;
            }
            default: {
                return undefined;
            }
        }
    }
    /* 获取距离最近的指定列表里类型建筑 0 代表无筛选，1代表hit受损 */
    getClosestStructure(sr, mode) {
        let resultstructure;
        switch (mode) {
            case 0: {
                // 无筛选
                resultstructure = this.findClosestByRange(FIND_STRUCTURES, { filter: (structure) => {
                        return filter_structure(structure, sr);
                    } });
                return resultstructure;
            }
            case 1: {
                // 筛选hit
                resultstructure = this.findClosestByRange(FIND_STRUCTURES, { filter: (structure) => {
                        return filter_structure(structure, sr) && structure.hits < structure.hitsMax;
                    } });
                return resultstructure;
            }
            default: {
                return undefined;
            }
        }
    }
    /* 获取最近的store能量有空的spawn或扩展 */
    getClosestStore() {
        return this.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
                return filter_structure(structure, [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_LAB]) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            } });
    }
    /* 获取资源矿点周围能开link的地方 */
    getSourceLinkVoid() {
        var result = [];
        var source_void = this.getSourceVoid();
        for (var x of source_void) {
            var link_void = x.getSourceVoid();
            if (link_void)
                for (var y of link_void) {
                    if (!isInArray(result, y))
                        result.push(y);
                }
        }
        var result2 = [];
        for (var i of result) {
            if (i.lookFor(LOOK_STRUCTURES).length == 0 && !i.isNearTo(this)) {
                result2.push(i);
            }
        }
        if (result2)
            return result2;
        //return result 
    }
    /* 获取矿点周围的开采空位 */
    getSourceVoid() {
        var result = [];
        var terrain = new Room.Terrain(this.roomName);
        var xs = [this.x - 1, this.x, this.x + 1];
        var ys = [this.y - 1, this.y, this.y + 1];
        xs.forEach(x => ys.forEach(y => {
            if (terrain.get(x, y) != TERRAIN_MASK_WALL) {
                result.push(new RoomPosition(x, y, this.roomName));
            }
        }));
        return result;
    }
    /* 获取该位置上指定类型建筑 */
    GetStructure(stru) {
        var lis = this.lookFor(LOOK_STRUCTURES);
        if (lis.length <= 0)
            return null;
        for (var i of lis) {
            if (i.structureType == stru)
                return i;
        }
        return null;
    }
    /* 获取该位置上指定类型建筑列表 */
    GetStructureList(stru) {
        var lis = this.lookFor(LOOK_STRUCTURES);
        if (lis.length <= 0)
            return [];
        var result = [];
        for (var i of lis) {
            if (isInArray(stru, i.structureType))
                result.push(i);
        }
        return result;
    }
    /* 获取该位置上有store的ruin */
    GetRuin() {
        var lis = this.lookFor(LOOK_RUINS);
        if (lis.length <= 0)
            return null;
        for (var i of lis) {
            if (i.store && Object.keys(i.store).length > 0)
                return i;
        }
        return null;
    }
    /* 寻找两个点之间的路线 */
    FindPath(target, range) {
        /* 全局路线存储 */
        if (!global.routeCache)
            global.routeCache = {};
        /* 路线查找 */
        const result = PathFinder.search(this, { pos: target, range: range }, {
            plainCost: 2,
            swampCost: 10,
            maxOps: 8000,
            roomCallback: roomName => {
                // 在全局绕过房间列表的房间 false
                if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName))
                    return false;
                const room = Game.rooms[roomName];
                // 没有视野的房间只观察地形
                if (!room)
                    return;
                // 有视野的房间
                let costs = new PathFinder.CostMatrix;
                // 将道路的cost设置为1，无法行走的建筑设置为255
                room.find(FIND_STRUCTURES).forEach(struct => {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        costs.set(struct.pos.x, struct.pos.y, 1);
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER &&
                        (struct.structureType !== STRUCTURE_RAMPART || (!struct.my)))
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                });
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(cons => {
                    if (cons.structureType != 'road' && cons.structureType != 'rampart' && cons.structureType != 'container')
                        costs.set(cons.pos.x, cons.pos.y, 255);
                });
                return costs;
            }
        });
        // 寻路异常返回null
        if (result.path.length <= 0)
            return null;
        // 寻路结果压缩
        return result.path;
    }
}

/* 位置原型拓展   --方法  --移动 */
class PositionFunctionMoveExtension extends RoomPosition {
    /* 获取当前位置目标方向的pos对象 */
    directionToPos(direction) {
        let targetX = this.x;
        let targetY = this.y;
        if (direction !== LEFT && direction !== RIGHT) {
            if (direction > LEFT || direction < RIGHT)
                targetY--;
            else
                targetY++;
        }
        if (direction !== TOP && direction !== BOTTOM) {
            if (direction < BOTTOM)
                targetX++;
            else
                targetX--;
        }
        if (targetX < 0 || targetY > 49 || targetX > 49 || targetY < 0)
            return undefined;
        else
            return new RoomPosition(targetX, targetY, this.roomName);
    }
}

// 定义好挂载顺序
const plugins$3 = [
    PositionFunctionFindExtension,
    PositionFunctionMoveExtension,
];
/**
* 依次挂载所有的拓展
*/
var mountPosition = () => plugins$3.forEach(plugin => assignPrototype(RoomPosition, plugin));

/* 房间原型拓展   --内核  --房间初始化 */
class RoomCoreInitExtension extends Room {
    /**
     * 房间初始化主函数
     */
    RoomInit() {
        this.RoomMemoryInit();
        this.RoomStructureInit();
        this.RoomSpawnListInit();
        this.RoomGlobalStructure();
    }
    /**
     * 所有RoomMemory的1级key都需要在这里注册
     */
    RoomMemoryInit() {
        if (!this.memory.StructureIdData)
            this.memory.StructureIdData = {};
        if (!this.memory.RoomLabBind)
            this.memory.RoomLabBind = {};
        if (!this.memory.SpawnConfig)
            this.memory.SpawnConfig = {};
        if (!this.memory.originLevel)
            this.memory.originLevel = 0;
        if (!this.memory.SpawnList)
            this.memory.SpawnList = [];
        if (!this.memory.state)
            this.memory.state = 'peace';
        if (!this.memory.CoolDownDic)
            this.memory.CoolDownDic = {};
        if (!this.memory.Misson)
            this.memory.Misson = {};
        if (!this.memory.Misson['Structure'])
            this.memory.Misson['Structure'] = [];
        if (!this.memory.Misson['Room'])
            this.memory.Misson['Room'] = [];
        if (!this.memory.Misson['Creep'])
            this.memory.Misson['Creep'] = [];
        if (!this.memory.Misson['PowerCreep'])
            this.memory.Misson['PowerCreep'] = [];
        if (!global.Stru[this.name])
            global.Stru[this.name] = {};
        if (!this.memory.TerminalData)
            this.memory.TerminalData = { 'energy': { num: 50000, fill: true } };
        if (!this.memory.market)
            this.memory.market = { 'deal': [], 'order': [] };
        if (!global.ResourceLimit[this.name])
            global.ResourceLimit[this.name] = {};
        if (!this.memory.ComDispatchData)
            this.memory.ComDispatchData = {};
        if (!this.memory.switch)
            this.memory.switch = {};
        if (!this.memory.enemy)
            this.memory.enemy = {};
    }
    /**
     * 定时刷新房间内的建筑，将建筑id储存起来  【已测试】
     */
    RoomStructureInit() {
        let level = this.controller.level;
        let StructureData = this.memory.StructureIdData;
        /* Spawn建筑记忆更新 */
        if (!StructureData.spawn)
            StructureData.spawn = [];
        if (level <= 6 && StructureData.spawn.length < 1) {
            let ASpawn = this.getStructure('spawn');
            for (let sp of ASpawn) {
                StructureData.spawn.push(sp.id);
            }
        }
        else if ((level == 7 && StructureData.spawn.length < 2) || (level >= 8 && StructureData.spawn.length < 3)) {
            if (Game.time % 10 == 0) {
                let ASpawn = this.getStructure('spawn');
                for (let sp of ASpawn) {
                    if (!isInArray(StructureData.spawn, sp.id))
                        StructureData.spawn.push(sp.id);
                }
            }
        }
        /* 中心点依赖建筑*/
        if (Memory.RoomControlData[this.name].center.length == 2) {
            let centerlist = Memory.RoomControlData[this.name].center;
            /* 中央link建筑记忆更新 */
            if (level >= 5 && !StructureData.center_link) {
                let position = new RoomPosition(centerlist[0], centerlist[1], this.name);
                let center_links = position.getRangedStructure(['link'], 3, 0);
                if (center_links.length >= 1)
                    StructureData.center_link = center_links[0].id;
            }
            /* 近塔记忆更新 (用于维护道路和container的塔) */
            if (!this.memory.StructureIdData.NtowerID && this.controller.level >= 3) {
                let position = new RoomPosition(centerlist[0], centerlist[1], this.name);
                var NTower = position.getClosestStructure([STRUCTURE_TOWER], 0);
                if (NTower && NTower.my)
                    if (getDistance(NTower.pos, position) < 7)
                        this.memory.StructureIdData.NtowerID = NTower.id;
            }
        }
        /* 资源矿记忆更新 */
        if (!StructureData.mineralID) {
            let Mineral_ = this.find(FIND_MINERALS);
            if (Mineral_.length == 1)
                this.memory.StructureIdData.mineralID = Mineral_[0].id;
        }
        /* 能量矿记忆更新*/
        if (!StructureData.source)
            StructureData.source = [];
        if (StructureData.source.length <= 0) {
            let allSource = this.find(FIND_SOURCES);
            let sourceIDs = [];
            allSource.forEach(sou => sourceIDs.push(sou.id));
            StructureData.source = sourceIDs;
        }
        /* 升级Link记忆更新 */
        if (!StructureData.source_links)
            StructureData.source_links = [];
        if (level >= 6 && !StructureData.upgrade_link) {
            let upgrade_link = this.controller.pos.getRangedStructure([STRUCTURE_LINK], 4, 0);
            if (upgrade_link.length >= 1)
                for (let ul of upgrade_link) {
                    if (!isInArray(StructureData.source_links, ul.id)) {
                        StructureData.upgrade_link = ul.id;
                        break;
                    }
                }
        }
        if (!StructureData.comsume_link) {
            StructureData.comsume_link = [];
        }
        /* 矿点link记忆更新 */
        if (level >= 5 && level < 6) {
            if (StructureData.source_links.length <= 0) {
                let temp_link_list = [];
                for (let sID of StructureData.source) {
                    let source_ = Game.getObjectById(sID);
                    let nearlink = source_.pos.getRangedStructure(['link'], 2, 0);
                    LoopLink: for (let l of nearlink) {
                        if (StructureData.upgrade_link && l.id == StructureData.upgrade_link)
                            continue LoopLink;
                        temp_link_list.push(l.id);
                    }
                }
                StructureData.source_links = temp_link_list;
            }
        }
        else if (level >= 7) {
            if (StructureData.source_links.length < StructureData.source.length) {
                let temp_link_list = [];
                for (let sID of StructureData.source) {
                    let source_ = Game.getObjectById(sID);
                    let nearlink = source_.pos.getRangedStructure(['link'], 2, 0);
                    LoopLink: for (let l of nearlink) {
                        if (StructureData.upgrade_link && l.id == StructureData.upgrade_link)
                            continue LoopLink;
                        temp_link_list.push(l.id);
                    }
                }
                StructureData.source_links = temp_link_list;
            }
        }
        /* 仓库记忆更新 */
        if (level >= 4 && !this.memory.StructureIdData.storageID) {
            var new_storage = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } });
            if (new_storage.length == 1)
                this.memory.StructureIdData.storageID = new_storage[0].id;
        }
        /* 防御塔记忆更新 */
        if (Game.time % 150 == 0 && this.controller.level >= 3) {
            if (!this.memory.StructureIdData.AtowerID)
                this.memory.StructureIdData.AtowerID = [];
            this.memory.StructureIdData.AtowerID;
            var ATowers = this.getStructure(STRUCTURE_TOWER);
            if (ATowers.length > this.memory.StructureIdData.AtowerID.length) {
                for (var t of ATowers)
                    if (t.my && !isInArray(this.memory.StructureIdData.AtowerID, t.id)) {
                        var AtowerID = this.memory.StructureIdData.AtowerID;
                        AtowerID.push(t.id);
                    }
            }
        }
        /* 终端识别 */
        if (!this.memory.StructureIdData.terminalID && level >= 6) {
            var Terminal = this.getStructure(STRUCTURE_TERMINAL);
            if (Terminal.length == 1)
                this.memory.StructureIdData.terminalID = Terminal[0].id;
        }
        /* 提取器识别 */
        if (!this.memory.StructureIdData.extractID && this.controller.level >= 5) {
            var extract = this.getStructure(STRUCTURE_EXTRACTOR);
            if (extract.length == 1)
                this.memory.StructureIdData.extractID = extract[0].id;
        }
        /* 实验室识别 */
        if (Game.time % 200 == 0) {
            var ALabs = this.getStructure(STRUCTURE_LAB);
            if (ALabs.length >= 1) {
                if (!this.memory.StructureIdData.labs)
                    this.memory.StructureIdData.labs = [];
                for (var llab of ALabs) {
                    if (llab.my && !isInArray(this.memory.StructureIdData.labs, llab.id)) {
                        var labs = this.memory.StructureIdData.labs;
                        labs.push(llab.id);
                    }
                }
            }
            /* 实验室合成数据 需要手动挂载，如果没有实验室合成数据，无法执行合成任务 */
            /* 里面包含自动合成相关的原料lab和产出lab数据 */
            if (!this.memory.StructureIdData.labInspect) {
                this.memory.StructureIdData.labInspect = {};
            }
        }
        /* 观察器识别 */
        if (!this.memory.StructureIdData.ObserverID && this.controller.level >= 8) {
            var observer_ = this.getStructure(STRUCTURE_OBSERVER);
            if (observer_.length > 0) {
                this.memory.StructureIdData.ObserverID = observer_[0].id;
            }
        }
        /* PowerSpawn识别 */
        if (!this.memory.StructureIdData.PowerSpawnID && this.controller.level >= 8) {
            var powerSpawn = this.getStructure(STRUCTURE_POWER_SPAWN);
            if (powerSpawn.length > 0)
                this.memory.StructureIdData.PowerSpawnID = powerSpawn[0].id;
        }
        /* 核弹识别 */
        if (!this.memory.StructureIdData.NukerID && this.controller.level >= 8) {
            var nuke_ = this.getStructure(STRUCTURE_NUKER);
            if (nuke_.length > 0) {
                this.memory.StructureIdData.NukerID = nuke_[0].id;
            }
        }
        /* 工厂识别 */
        if (!this.memory.StructureIdData.FactoryId && this.controller.level >= 8) {
            var factory_ = this.getStructure(STRUCTURE_FACTORY);
            if (factory_.length > 0) {
                this.memory.StructureIdData.FactoryId = factory_[0].id;
            }
        }
        // harvestData 数据更新
        if (!this.memory.harvestData) {
            this.memory.harvestData = {};
            for (let source_ of this.memory.StructureIdData.source) {
                this.memory.harvestData[source_] = {};
            }
        }
        if (Game.time % 17 == 0)
            for (let id in this.memory.harvestData) {
                if (level < 5) {
                    if (!this.memory.harvestData[id].containerID) {
                        let source = Game.getObjectById(id);
                        let containers = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: (stru) => { return stru.structureType == 'container'; } });
                        if (containers.length > 0)
                            this.memory.harvestData[id].containerID = containers[0].id;
                    }
                }
                else if (level >= 5) {
                    let source = Game.getObjectById(id);
                    if (!this.memory.harvestData[id].linkID) {
                        if (!this.memory.harvestData[id].containerID) {
                            let containers = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: (stru) => { return stru.structureType == 'container'; } });
                            if (containers.length > 0)
                                this.memory.harvestData[id].containerID = containers[0].id;
                        }
                        let links = source.pos.findInRange(FIND_STRUCTURES, 2, { filter: (stru) => { return stru.structureType == 'link'; } });
                        if (links.length > 0)
                            this.memory.harvestData[id].linkID = links[0].id;
                    }
                    else {
                        if (this.memory.harvestData[id].containerID) {
                            let container = Game.getObjectById(this.memory.harvestData[id].containerID);
                            if (container) {
                                this.unbindMemory('container', container.pos.x, container.pos.y);
                                container.destroy();
                            }
                            delete this.memory.harvestData[id].containerID;
                        }
                    }
                }
                else {
                    if (!this.memory.harvestData[id].linkID) {
                        let source = Game.getObjectById(id);
                        let links = source.pos.findInRange(FIND_STRUCTURES, 2, { filter: (stru) => { return stru.structureType == 'container'; } });
                        if (links.length > 0)
                            this.memory.harvestData[id].linkID = links[0].id;
                    }
                }
            }
    }
    /**
     * 房间孵化队列初始化
     */
    RoomSpawnListInit() {
        if (!global.CreepBodyData)
            global.CreepBodyData = {};
        if (!global.CreepBodyData[this.name])
            global.CreepBodyData[this.name] = {};
        if (!global.CreepNumData)
            global.CreepNumData = {};
        if (!global.CreepNumData[this.name])
            global.CreepNumData[this.name] = {};
    }
    /**
     * 房间全局建筑初始化
     */
    RoomGlobalStructure() {
        // 目前只支持 storage terminal factory powerspawn
        if (this.memory.StructureIdData.storageID) {
            global.Stru[this.name]['storage'] = Game.getObjectById(this.memory.StructureIdData.storageID);
            if (!global.Stru[this.name]['storage']) {
                delete this.memory.StructureIdData.storageID;
            }
        }
        if (this.memory.StructureIdData.terminalID) {
            global.Stru[this.name]['terminal'] = Game.getObjectById(this.memory.StructureIdData.terminalID);
            if (!global.Stru[this.name]['terminal']) {
                delete this.memory.StructureIdData.terminalID;
            }
        }
        if (this.memory.StructureIdData.PowerSpawnID) {
            global.Stru[this.name]['powerspawn'] = Game.getObjectById(this.memory.StructureIdData.PowerSpawnID);
            if (!global.Stru[this.name]['powerspawn']) {
                delete this.memory.StructureIdData.PowerSpawnID;
            }
        }
        if (this.memory.StructureIdData.FactoryId) {
            global.Stru[this.name]['factory'] = Game.getObjectById(this.memory.StructureIdData.FactoryId);
            if (!global.Stru[this.name]['factory']) {
                delete this.memory.StructureIdData.FactoryId;
            }
        }
        if (this.memory.StructureIdData.NtowerID) {
            global.Stru[this.name]['Ntower'] = Game.getObjectById(this.memory.StructureIdData.NtowerID);
            if (!global.Stru[this.name]['Ntower']) {
                delete this.memory.StructureIdData.NtowerID;
            }
        }
        if (this.memory.StructureIdData.AtowerID && this.memory.StructureIdData.AtowerID.length > 0) {
            var otlist = global.Stru[this.name]['Atower'] = [];
            for (var ti of this.memory.StructureIdData.AtowerID) {
                var ot = Game.getObjectById(ti);
                if (!ot) {
                    var index = this.memory.StructureIdData.AtowerID.indexOf(ti);
                    this.memory.StructureIdData.AtowerID.splice(index, 1);
                    continue;
                }
                otlist.push(ot);
            }
        }
    }
}

/**
 * 存放非任务类型角色相关的函数
*/
// 采矿工
function harvest_(creep_) {
    if (!Game.rooms[creep_.memory.belong])
        return;
    creep_.workstate('energy');
    if (!Game.rooms[creep_.memory.belong].memory.harvestData)
        return;
    if (creep_.memory.working) {
        let data = Game.rooms[creep_.memory.belong].memory.harvestData[creep_.memory.targetID];
        if (!data)
            return;
        // 优先寻找link
        if (data.linkID) {
            let link = Game.getObjectById(data.linkID);
            if (!link)
                delete data.linkID;
            else {
                if (link.hits < link.hitsMax) {
                    creep_.repair(link);
                    return;
                }
                if (creep_.pos.isNearTo(link))
                    creep_.transfer(link, 'energy');
                else
                    creep_.goTo(link.pos, 1);
            }
            return;
        }
        // 其次寻找container
        if (data.containerID) {
            let container = Game.getObjectById(data.containerID);
            if (!container)
                delete data.containerID;
            else {
                if (container.hits < container.hitsMax) {
                    creep_.repair(container);
                    return;
                }
                if (creep_.pos.isNearTo(container))
                    creep_.transfer(container, 'energy');
                else
                    creep_.goTo(container.pos, 1);
            }
            return;
        }
        /* 最后寻找附近的建筑工地 */
        let cons = creep_.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
        if (cons.length > 0)
            creep_.build(cons[0]);
        else
            creep_.pos.createConstructionSite('container');
        return;
    }
    else {
        // 如果不具备挖矿功能了，就自杀
        if (creep_.getActiveBodyparts('work') <= 0) {
            creep_.suicide();
        }
        // 绑定矿点
        if (!creep_.memory.targetID) {
            for (var i in Game.rooms[creep_.memory.belong].memory.harvestData) {
                var data_ = Game.rooms[creep_.memory.belong].memory.harvestData[i];
                if (data_.carry == creep_.name) {
                    creep_.memory.targetID = i;
                    break;
                }
                if (!data_.harvest || !Game.creeps[data_.harvest]) {
                    creep_.memory.targetID = i;
                    data_.harvest = creep_.name;
                    break;
                }
            }
            return;
        }
        /* 寻找target附近的container */
        let source = Game.getObjectById(creep_.memory.targetID);
        if (!source)
            return;
        if (!creep_.pos.isNearTo(source)) {
            creep_.goTo(source.pos, 1);
            return;
        }
        let data = Game.rooms[creep_.memory.belong].memory.harvestData[creep_.memory.targetID];
        if (!data)
            return;
        if (data.linkID || data.containerID) {
            creep_.say("😒", true);
        }
        else {
            creep_.say("🤪", true);
        }
        if (Game.time % 5 == 0) {
            var is = creep_.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
            if (is.length > 0 && is[0].amount > 20 && is[0].resourceType == 'energy') {
                creep_.pickup(is[0]);
                return;
            }
        }
        creep_.harvest(source);
    }
}
// 搬运工
function carry_(creep_) {
    if (!Game.rooms[creep_.memory.belong])
        return;
    creep_.workstate('energy');
    if (!creep_.memory.containerID) {
        var harvestData = Game.rooms[creep_.memory.belong].memory.harvestData;
        if (!harvestData)
            return;
        if (Object.keys(harvestData).length == 0)
            return;
        else if (Object.keys(harvestData).length > 1) {
            for (var i in Game.rooms[creep_.memory.belong].memory.harvestData) {
                var data_ = Game.rooms[creep_.memory.belong].memory.harvestData[i];
                if (data_.carry == creep_.name) {
                    creep_.memory.containerID = data_.containerID;
                    break;
                }
                if ((!data_.carry || !Game.creeps[data_.carry]) && data_.containerID) {
                    creep_.memory.containerID = data_.containerID;
                    data_.carry = creep_.name;
                    break;
                }
            }
            return;
        }
        else {
            var harvestData_ = harvestData[Object.keys(harvestData)[0]];
            if (harvestData_.containerID) {
                let container = Game.getObjectById(harvestData_.containerID);
                if (!container)
                    delete harvestData_.containerID;
                else {
                    creep_.memory.containerID = harvestData_.containerID;
                }
            }
            else
                creep_.say("oh No!");
            return;
        }
    }
    if (creep_.memory.working) {
        let target = null;
        if (Game.rooms[creep_.memory.belong].memory.StructureIdData.storageID) // 优先仓库
         {
            target = Game.getObjectById(Game.rooms[creep_.memory.belong].memory.StructureIdData.storageID);
            if (!target)
                delete Game.rooms[creep_.memory.belong].memory.StructureIdData.storageID;
        }
        if (!target) // 其次虫卵
         {
            target = creep_.pos.getClosestStore();
        }
        if (!target) // 再其次防御塔
         {
            target = creep_.pos.findClosestByRange(FIND_STRUCTURES, { filter: (stru) => {
                    return stru.structureType == 'tower' && stru.store.getFreeCapacity('energy') > creep_.store.getUsedCapacity('energy');
                } });
        }
        if (!target)
            return;
        creep_.transfer_(target, 'energy');
    }
    else {
        let container = Game.getObjectById(creep_.memory.containerID);
        if (!container) {
            delete creep_.memory.containerID;
            return;
        }
        if (!creep_.pos.isNearTo(container))
            creep_.goTo(container.pos, 1);
        else {
            if (container.store.getUsedCapacity('energy') > creep_.store.getFreeCapacity())
                creep_.withdraw(container, 'energy');
        }
    }
}
// 升级工
function upgrade_(creep_) {
    if (!Game.rooms[creep_.memory.belong])
        return;
    creep_.workstate('energy');
    if (creep_.memory.working) {
        creep_.upgrade_();
        delete creep_.memory.targetID;
    }
    else {
        if (Game.flags[`${creep_.memory.belong}/ruin`]) {
            if (!creep_.pos.isNearTo(Game.flags[`${creep_.memory.belong}/ruin`]))
                creep_.goTo(Game.flags[`${creep_.memory.belong}/ruin`].pos, 1);
            else {
                let ruin = Game.flags[`${creep_.memory.belong}/ruin`].pos.lookFor(LOOK_RUINS);
                let swi = false;
                for (var i of ruin) {
                    if (i.store.getUsedCapacity('energy') > 0) {
                        creep_.withdraw(i, 'energy');
                        swi = true;
                        return;
                    }
                }
                if (!swi)
                    Game.flags[`${creep_.memory.belong}/ruin`].remove();
            }
            return;
        }
        if (!creep_.memory.targetID) {
            let target = null;
            if (Game.rooms[creep_.memory.belong].memory.StructureIdData.upgrade_link) // 优先Link
             {
                target = Game.getObjectById(Game.rooms[creep_.memory.belong].memory.StructureIdData.upgrade_link);
                if (!target)
                    delete Game.rooms[creep_.memory.belong].memory.StructureIdData.upgrade_link;
            }
            else if (Game.rooms[creep_.memory.belong].memory.StructureIdData.storageID) // 优先仓库
             {
                target = Game.getObjectById(Game.rooms[creep_.memory.belong].memory.StructureIdData.storageID);
                if (!target)
                    delete Game.rooms[creep_.memory.belong].memory.StructureIdData.storageID;
            }
            if (!target) // 其次container
             {
                target = creep_.pos.findClosestByRange(FIND_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == 'container' && stru.store.getUsedCapacity('energy') > creep_.store.getFreeCapacity();
                    } });
            }
            if (!target) {
                creep_.say("😑", true);
                return;
            }
            else {
                creep_.memory.targetID = target.id;
            }
        }
        else {
            let target = Game.getObjectById(creep_.memory.targetID);
            if (target)
                creep_.withdraw_(target, 'energy');
        }
    }
}
// 建筑工
function build_(creep) {
    var thisRoom = Game.rooms[creep.memory.belong];
    if (!thisRoom)
        return;
    if (!creep.memory.standed)
        creep.memory.standed = false;
    creep.workstate('energy');
    if (creep.memory.working) {
        var construction = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if (construction) {
            creep.build_(construction);
        }
        else {
            /* 没有建筑物则考虑道路维护 */
            var roads = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => {
                    return structure.structureType == 'road' && structure.hits < structure.hitsMax;
                } });
            if (roads) {
                creep.say("🛠️", true);
                if (creep.repair(roads) == ERR_NOT_IN_RANGE) {
                    creep.goTo(roads.pos, 1);
                }
                if (getDistance(creep.pos, roads.pos) <= 3)
                    creep.memory.standed = false;
            }
        }
    }
    else {
        creep.memory.standed = false;
        if (Game.flags[`${creep.memory.belong}/ruin`]) {
            if (!creep.pos.isNearTo(Game.flags[`${creep.memory.belong}/ruin`]))
                creep.goTo(Game.flags[`${creep.memory.belong}/ruin`].pos, 1);
            else {
                let ruin = Game.flags[`${creep.memory.belong}/ruin`].pos.lookFor(LOOK_RUINS);
                let swi = false;
                for (var i of ruin) {
                    if (i.store.getUsedCapacity('energy') > 0) {
                        creep.withdraw(i, 'energy');
                        swi = true;
                        return;
                    }
                }
                if (!swi)
                    Game.flags[`${creep.memory.belong}/ruin`].remove();
            }
            return;
        }
        /* 如果有storage就去storage里找，没有就自己采集 */
        if (thisRoom.memory.StructureIdData.storageID || thisRoom.memory.StructureIdData.terminalID) {
            var storage = Game.getObjectById(thisRoom.memory.StructureIdData.storageID);
            if (!storage) {
                delete thisRoom.memory.StructureIdData.storageID;
            }
            if (storage && storage.store.getUsedCapacity('energy') >= creep.store.getCapacity())
                creep.withdraw_(storage, 'energy');
            else {
                let terminal_ = Game.getObjectById(Game.rooms[creep.memory.belong].memory.StructureIdData.terminalID);
                if (terminal_ && terminal_.store.getUsedCapacity('energy') >= creep.store.getCapacity())
                    creep.withdraw_(terminal_, 'energy');
            }
        }
        else {
            var container = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (stru) => { return stru.structureType == 'container' && stru.store.getUsedCapacity('energy') > creep.store.getCapacity(); } });
            if (container) {
                if (!creep.pos.isNearTo(container)) {
                    creep.goTo(container.pos, 1);
                }
                else {
                    creep.withdraw(container, 'energy');
                }
            }
        }
    }
}

/* 爬虫信息列表 */
const RoleData = {
    'harvest': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], adaption: true, level: 5, mark: "⛏️", init: true, fun: harvest_ },
    'carry': { num: 0, ability: [0, 3, 3, 0, 0, 0, 0, 0], level: 5, mark: "🛢️", init: true, adaption: true, fun: carry_ },
    'upgrade': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], level: 10, mark: "🚬", init: true, fun: upgrade_ },
    'build': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], level: 10, mark: "🛠️", init: true, fun: build_, must: true },
    'manage': { num: 0, ability: [0, 1, 1, 0, 0, 0, 0, 0], level: 2, mark: "🚚", init: true, must: true, adaption: true },
    'transport': { num: 0, ability: [0, 2, 2, 0, 0, 0, 0, 0], level: 1, mark: "🚛", init: true, must: true, adaption: true },
    'repair': { num: 0, ability: [1, 1, 1, 0, 0, 0, 0, 0], level: 2, mark: "🧱", must: true },
    'cclaim': { num: 0, ability: [0, 0, 1, 0, 0, 0, 1, 0], level: 10, mark: "🐱" },
    'cupgrade': { num: 0, ability: [2, 5, 7, 0, 0, 0, 0, 0], level: 11, mark: "🐱" },
    'dismantle': { num: 0, ability: [25, 0, 25, 0, 0, 0, 0, 0], level: 11, mark: "⚡" },
    'rush': { num: 0, ability: [10, 2, 5, 0, 0, 0, 0, 0], level: 11, mark: "🚬" },
    'truck': { num: 0, ability: [0, 10, 10, 0, 0, 0, 0, 0], level: 9, mark: "✈️" },
    'claim': { num: 0, ability: [0, 0, 1, 0, 0, 0, 1, 0], level: 10, mark: "🟣" },
    'Ebuild': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], level: 13, mark: "🛠️" },
    'Eupgrade': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], level: 13, mark: "🛠️" },
    'double-attack': { num: 0, ability: [0, 0, 10, 28, 0, 0, 0, 12], level: 10, mark: "⚔️", must: true },
    'double-heal': { num: 0, ability: [0, 0, 10, 0, 0, 28, 0, 12], level: 10, mark: "💉", must: true },
    'claim-attack': { num: 0, ability: [0, 0, 15, 0, 0, 0, 15, 0], level: 10, mark: "🟣" },
    'architect': { num: 0, ability: [15, 10, 10, 0, 0, 10, 0, 5], level: 10, mark: "🚒" },
    'scout': { num: 0, ability: [0, 0, 1, 0, 0, 0, 0, 0], level: 15, mark: '✏️' },
    'aio': { num: 0, ability: [0, 0, 25, 0, 10, 15, 0, 0], level: 10, mark: "🌈" },
    'mineral': { num: 0, ability: [15, 15, 15, 0, 0, 0, 0, 0], level: 11, mark: "⛏️" },
    /* 外矿 */
    'out-claim': { num: 0, ability: [0, 0, 2, 0, 0, 0, 2, 0], level: 11, mark: "🟣" },
    'out-harvest': { num: 0, ability: [4, 2, 4, 0, 0, 0, 0, 0], level: 12, mark: "⛏️" },
    'out-car': { num: 0, ability: [1, 5, 6, 0, 0, 0, 0, 0], level: 12, mark: "🔘" },
    'out-defend': { num: 0, ability: [0, 0, 5, 5, 0, 5, 0, 0], level: 10, mark: "🧹" },
    /* 帕瓦 */
    'power-attack': { num: 0, ability: [0, 0, 20, 20, 0, 0, 0, 0], level: 10, mark: "🍎" },
    'power-heal': { num: 0, ability: [0, 0, 25, 0, 0, 25, 0, 0], level: 10, mark: "🍏" },
    'power-carry': { num: 0, ability: [0, 32, 16, 0, 0, 0, 0, 0], level: 10, mark: "🥚" },
    /* 沉积物 */
    'deposit': { num: 0, ability: [15, 10, 25, 0, 0, 0, 0, 0], level: 11, mark: "⚙️" },
    /* 主动防御 */
    'defend-attack': { num: 0, ability: [0, 0, 10, 40, 0, 0, 0, 0], level: 8, mark: "🔴", must: true },
    'defend-range': { num: 0, ability: [0, 0, 10, 0, 40, 0, 0, 0], level: 8, mark: "🔵", must: true },
    'defend-douAttack': { num: 0, ability: [0, 0, 10, 30, 0, 0, 0, 10], level: 7, mark: "🔴", must: true },
    'defend-douHeal': { num: 0, ability: [0, 0, 10, 0, 0, 30, 0, 10], level: 7, mark: "🟢", must: true },
    /* 四人小队 */
    'x-dismantle': { num: 0, ability: [28, 0, 10, 0, 0, 0, 0, 12], level: 9, mark: "🟨", must: true, mem: { creepType: 'attack' } },
    'x-heal': { num: 0, ability: [0, 0, 10, 0, 2, 26, 0, 12], level: 9, mark: "🟩", must: true, mem: { creepType: 'heal' } },
    'x-attack': { num: 0, ability: [0, 0, 10, 28, 0, 0, 0, 12], level: 9, mark: "🟥", must: true, mem: { creepType: 'attack' } },
    'x-range': { num: 0, ability: [0, 0, 10, 0, 24, 4, 0, 12], level: 9, mark: "🟦", must: true, mem: { creepType: 'attack' } },
    'x-aio': { num: 0, ability: [0, 0, 10, 0, 10, 20, 0, 10], level: 9, mark: "🌈", must: true, mem: { creepType: 'heal' } },
};
/* 爬虫部件随房间等级变化的动态列表 */
const RoleLevelData = {
    'harvest': {
        1: { bodypart: [2, 1, 1, 0, 0, 0, 0, 0], num: 2 },
        2: { bodypart: [3, 1, 2, 0, 0, 0, 0, 0], num: 2 },
        3: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 2 },
        4: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 2 },
        5: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        7: { bodypart: [10, 2, 5, 0, 0, 0, 0, 0], num: 2 },
        8: { bodypart: [10, 2, 5, 0, 0, 0, 0, 0], num: 2 },
    },
    'carry': {
        1: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 2 },
        2: { bodypart: [0, 3, 3, 0, 0, 0, 0, 0], num: 2 },
        3: { bodypart: [0, 4, 4, 0, 0, 0, 0, 0], num: 2 },
        4: { bodypart: [0, 6, 6, 0, 0, 0, 0, 0], num: 2 },
        5: { bodypart: [0, 6, 6, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [0, 6, 6, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
    },
    'upgrade': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 4 },
        2: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 3 },
        3: { bodypart: [3, 3, 6, 0, 0, 0, 0, 0], num: 3 },
        4: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 2 },
        5: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [5, 2, 5, 0, 0, 0, 0, 0], num: 2 },
        7: { bodypart: [10, 2, 10, 0, 0, 0, 0, 0], num: 2 },
        8: { bodypart: [15, 3, 15, 0, 0, 0, 0, 0], num: 1 },
    },
    'build': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 1 },
        2: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 1 },
        3: { bodypart: [3, 3, 6, 0, 0, 0, 0, 0], num: 1 },
        4: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 1 },
        5: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [5, 5, 10, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [10, 10, 10, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [15, 15, 15, 0, 0, 0, 0, 0], num: 0 },
    },
    'transport': {
        1: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 1 },
        5: { bodypart: [0, 4, 4, 0, 0, 0, 0, 0], num: 1 },
        6: { bodypart: [0, 10, 10, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [0, 24, 24, 0, 0, 0, 0, 0], num: 1 },
        8: { bodypart: [0, 24, 24, 0, 0, 0, 0, 0], num: 1 },
    },
    'manage': {
        1: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 1 },
        5: { bodypart: [0, 10, 5, 0, 0, 0, 0, 0], num: 1 },
        6: { bodypart: [0, 15, 5, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [0, 20, 10, 0, 0, 0, 0, 0], num: 1 },
        8: { bodypart: [0, 32, 16, 0, 0, 0, 0, 0], num: 1 },
    },
    'repair': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [3, 3, 3, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [6, 6, 6, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [10, 10, 10, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [15, 10, 15, 0, 0, 0, 0, 0], num: 0 },
    },
    'dismantle': {
        1: { bodypart: [1, 0, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [2, 0, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [3, 0, 3, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [3, 0, 3, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [6, 0, 6, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [10, 0, 10, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [20, 0, 20, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [25, 0, 25, 0, 0, 0, 0, 0], num: 0 },
    },
    'rush': {
        6: { bodypart: [17, 1, 9, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [39, 1, 10, 0, 0, 0, 0, 0], num: 0 },
    },
    'truck': {
        1: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 4, 4, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 4, 4, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [0, 8, 8, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [0, 10, 10, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [0, 20, 20, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [0, 25, 25, 0, 0, 0, 0, 0], num: 0 },
    },
    'Ebuild': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [5, 5, 10, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [10, 10, 20, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [10, 10, 20, 0, 0, 0, 0, 0], num: 0 },
    },
    'Eupgrade': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [5, 5, 10, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [10, 10, 20, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [10, 10, 20, 0, 0, 0, 0, 0], num: 0 },
    },
    "out-harvest": {
        1: { bodypart: [1, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [1, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [2, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [4, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [6, 1, 3, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [7, 2, 7, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [8, 2, 7, 0, 0, 0, 0, 0], num: 0 },
    },
    "out-car": {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [1, 2, 3, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [1, 5, 3, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [1, 7, 4, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [1, 11, 6, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [2, 26, 14, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [2, 30, 16, 0, 0, 0, 0, 0], num: 0 },
    },
    "out-defend": {
        1: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        2: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        3: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        4: { bodypart: [0, 0, 3, 0, 2, 2, 0, 0], num: 0 },
        5: { bodypart: [0, 0, 6, 0, 3, 3, 0, 0], num: 0 },
        6: { bodypart: [0, 0, 8, 0, 4, 4, 0, 0], num: 0 },
        7: { bodypart: [0, 0, 16, 0, 8, 8, 0, 0], num: 0 },
        8: { bodypart: [0, 0, 20, 0, 10, 10, 0, 0], num: 0 },
    },
};

/**
 * *************** 此文件代码无需理解,只需会用即可 ***************
 */
/* 房间原型拓展   --内核  --房间孵化 */
class RoomCoreSpawnExtension extends Room {
    /* 孵化总函数 */
    SpawnMain() {
        this.SpawnConfigInit();
        this.SpawnConfigModify();
        this.SpawnManager();
        this.Economy();
    }
    /* 爬虫孵化配置初始化 */
    SpawnConfigInit() {
        if (!this.memory.SpawnConfig)
            this.memory.SpawnConfig = {};
        /* 初始化 */
        for (let role in RoleData) {
            if (RoleData[role].init && !this.memory.SpawnConfig[role]) {
                this.memory.SpawnConfig[role] = {
                    num: 0,
                    must: RoleData[role].must,
                    adaption: RoleData[role].adaption,
                };
                if (RoleData[role].level) {
                    this.memory.SpawnConfig[role].level = RoleData[role].level;
                }
            }
        }
    }
    /* 爬虫孵化配置二次加工 【随房间控制等级的变化而变化】 */
    SpawnConfigModify() {
        /* 身体部件信息二次加工 */
        for (let role in RoleLevelData) {
            if (RoleLevelData[role][this.controller.level])
                global.CreepBodyData[this.name][role] = RoleLevelData[role][this.controller.level].bodypart;
        }
        /* 数量信息二次加工 */
        if (this.controller.level != this.memory.originLevel)
            for (let role in this.memory.SpawnConfig) {
                var role_ = this.memory.SpawnConfig[role];
                if (!role_.manual && RoleLevelData[role] && RoleLevelData[role][this.controller.level]) {
                    role_.num = RoleLevelData[role][this.controller.level].num;
                }
            }
    }
    /* 爬虫孵化管理器 */
    SpawnManager() {
        LoopA: for (let role in this.memory.SpawnConfig) {
            var role_ = this.memory.SpawnConfig[role];
            // 战争状态下爬虫停止生产
            if (this.memory.state == 'war') {
                if (!role_.must)
                    continue LoopA;
            }
            /* 固定 补员型 */
            let roleNum = global.CreepNumData[this.name][role];
            if (roleNum === undefined)
                roleNum = 0;
            if (roleNum == 0 && role_.misson) // 任务类型的就删了
             {
                delete this.memory.SpawnConfig[role];
                continue;
            }
            if (this.memory.SpawnConfig[role] && (!roleNum || roleNum < this.memory.SpawnConfig[role].num)) {
                /* 计算SpawnList里相关role的个数 */
                let num_ = this.SpawnListRoleNum(role);
                if (num_ + roleNum < this.memory.SpawnConfig[role].num) {
                    /* 开始添加一个孵化任务进孵化队列 */
                    if (global.CreepBodyData[this.name][role])
                        this.AddSpawnList(role, global.CreepBodyData[this.name][role], role_.level ? role_.level : 10, RoleData[role].mem);
                    else
                        this.AddSpawnList(role, RoleData[role].ability, role_.level ? role_.level : 10, RoleData[role].mem);
                }
            }
        }
    }
    /* 孵化函数 */
    SpawnExecution() {
        // 没有孵化任务就return
        if (!this.memory.SpawnList || this.memory.SpawnList.length <= 0)
            return;
        // 如果没有spawn就return
        if (!this.memory.StructureIdData.spawn || this.memory.StructureIdData.spawn.length <= 0)
            return;
        for (let sID of this.memory.StructureIdData.spawn) {
            let thisSpawn = Game.getObjectById(sID);
            if (!thisSpawn) {
                /* 没有该spawn说明spawn已经被摧毁或者被拆除了，删除structureData里的数据 */
                var spawnMemoryList = this.memory.StructureIdData.spawn;
                var index = spawnMemoryList.indexOf(sID);
                spawnMemoryList.splice(index, 1);
                continue;
            }
            // 正在孵化就跳过该spawn
            if (thisSpawn.spawning)
                continue;
            var spawnlist = this.memory.SpawnList;
            if (spawnlist.length <= 0)
                return;
            let roleName = spawnlist[0].role;
            let mem = spawnlist[0].memory;
            let bd = spawnlist[0].body;
            let body = GenerateAbility(bd[0], bd[1], bd[2], bd[3], bd[4], bd[5], bd[6], bd[7]);
            // 如果global有该爬虫的部件信息，优先用global的数据
            if (global.SpecialBodyData[this.name][roleName]) {
                body = global.SpecialBodyData[this.name][roleName];
            }
            /* 对爬虫数据进行自适应 */
            let allEnergyCapacity = this.energyCapacityAvailable;
            if (allEnergyCapacity < CalculateEnergy(body))
                adaption_body(body, allEnergyCapacity);
            /* 对具备自适应属性的爬虫进行自适应 */
            let allEnergy = this.energyAvailable;
            let adaption = false;
            if (this.memory.SpawnConfig[roleName] && this.memory.SpawnConfig[roleName].adaption && allEnergy < CalculateEnergy(body)) {
                if (global.CreepNumData[this.name][roleName] <= 0) {
                    adaption_body(body, allEnergy);
                    adaption = true;
                }
                else if (this.controller.level < 4 && roleName == 'harvest' && global.CreepNumData[this.name]['carry'] <= 0) {
                    /* 特殊情况，防止卡死 */
                    adaption_body(body, allEnergy);
                    adaption = true;
                }
            }
            // 名称整理
            let mark = RoleData[roleName].mark ? RoleData[roleName].mark : "#";
            let timestr = Game.time.toString().substr(Game.time.toString().length - 4);
            let randomStr = Math.random().toString(36).substr(3);
            // 记忆整理
            let bodyData = {};
            for (var b of body) {
                if (!bodyData[b])
                    bodyData[b] = {};
            }
            var thisMem = {
                role: roleName,
                belong: this.name,
                shard: Game.shard.name,
                boostData: bodyData,
                working: false,
                adaption: false
            };
            if (adaption)
                thisMem.adaption = true; // 代表该爬虫是被自适应过孵化的，如果能量充足应该重新孵化
            // 额外记忆添加
            if (mem) {
                for (var i in mem) {
                    thisMem[i] = mem[i];
                }
            }
            let result = thisSpawn.spawnCreep(body, `【${mark}】${randomStr}|${timestr}`, { memory: thisMem });
            if (result == OK) {
                // console.log("即将删除：",spawnlist[0].role,",spawnID:",thisSpawn.id)
                spawnlist.splice(0, 1); // 孵化成功，删除该孵化数据
                if (global.SpecialBodyData[this.name][roleName])
                    delete global.SpecialBodyData[this.name][roleName]; // 删除特殊体型数据
            }
            return;
        }
        /* 说明所有spawn都繁忙或当前能量不适合孵化该creep */
        return;
    }
    /* 【功能函数】添加孵化任务 */
    AddSpawnList(role, body, level, mem) {
        let spawnMisson = { role: role, body: body, level: level };
        if (mem)
            spawnMisson.memory = mem;
        this.memory.SpawnList.push(spawnMisson);
        // 根据优先级排序
        this.memory.SpawnList.sort(compare('level'));
    }
    /* 【功能函数】查看孵化队列角色数目 */
    SpawnListRoleNum(role) {
        if (!this.memory.SpawnList)
            return 0;
        let num_ = 0;
        for (var obj of this.memory.SpawnList)
            if (obj.role == role)
                num_ += 1;
        return num_;
    }
    /* 【功能函数】数量孵化 */
    NumSpawn(role, num, level) {
        if (!this.memory.SpawnConfig[role])
            this.memory.SpawnConfig[role] = { num: num, level: level };
        if (this.memory.SpawnConfig[role].misson) {
            console.log("任务角色！不能进行数量孵化！角色为", role);
            return false;
        }
        this.memory.SpawnConfig[role].num = num;
        if (level)
            this.memory.SpawnConfig[role].level = level;
        if (!this.memory.SpawnConfig[role].level) {
            let level_ = RoleData[role].level ? RoleData[role].level : 10;
            this.memory.SpawnConfig[role].level = level_;
        }
        return true;
    }
    /* 【功能函数】单次孵化 */
    SingleSpawn(role, level, mem) {
        let body_ = RoleData[role].ability;
        if (global.CreepBodyData[this.name][role])
            body_ = global.CreepBodyData[this.name][role];
        let level_ = level ? level : 10;
        this.AddSpawnList(role, body_, level_, mem);
        return true;
    }
    /* 经济模式特殊处理 */
    Economy() {
        if (this.controller.level == 8 && this.memory.economy) {
            if (this.controller.ticksToDowngrade < 180000)
                this.memory.SpawnConfig['upgrade'].num = 1;
            else
                this.memory.SpawnConfig['upgrade'].num = 0;
        }
    }
}

/* 房间原型拓展   --方法  --寻找 */
class RoomFunctionFindExtension extends Room {
    /* 获取指定structureType的建筑列表 */
    getStructure(sc) {
        return this.find(FIND_STRUCTURES, { filter: { structureType: sc } });
    }
    /* 任务lab绑定数据生成便捷函数 */
    Bind_Lab(rTypes) {
        var result = {};
        var tempList = [];
        LoopA: for (var i of rTypes) {
            /* 计算是否已经存在相关lab */
            for (var occ_lab_id in this.memory.RoomLabBind) {
                if (this.memory.RoomLabBind[occ_lab_id].rType == i && !this.memory.RoomLabBind[occ_lab_id].occ) {
                    result[occ_lab_id] = i;
                    continue LoopA;
                }
            }
            LoopB: for (var all_lab_id of this.memory.StructureIdData.labs) {
                var occ_lab = Object.keys(this.memory.RoomLabBind);
                if (!isInArray(occ_lab, all_lab_id) && !isInArray(tempList, all_lab_id)) {
                    var thisLab = Game.getObjectById(all_lab_id);
                    if (!thisLab) {
                        var index = this.memory.StructureIdData.labs.indexOf(all_lab_id);
                        this.memory.StructureIdData.labs.splice(index, 1);
                        continue LoopB;
                    }
                    if (thisLab.store) {
                        if (Object.keys(thisLab.store).length <= 1) {
                            result[all_lab_id] = i;
                            tempList.push(all_lab_id);
                            continue LoopA;
                        }
                        else if (Object.keys(thisLab.store).length == 1) {
                            if (thisLab.store['energy'] > 0) {
                                result[all_lab_id] = i;
                                tempList.push(all_lab_id);
                                continue LoopA;
                            }
                            continue LoopB;
                        }
                        else if (Object.keys(thisLab.store).length > 1)
                            continue LoopB;
                    }
                }
            }
            return null;
        }
        return result;
    }
    /* 获取指定列表中类型的hit最小的建筑 (比值) 返回值： Structure | undefined */
    getListHitsleast(sc, mode) {
        if (!mode)
            mode = 2;
        /* 3 */
        if (mode == 3)
            mode = 0;
        let s_l = this.find(FIND_STRUCTURES, { filter: (structure) => {
                return filter_structure(structure, sc) && structure.hits < structure.hitsMax;
            } });
        let least_ = LeastHit(s_l, mode);
        return least_;
    }
    /* 获取指定类型的建筑 */
    getTypeStructure(sr) {
        var resultstructure = this.find(FIND_STRUCTURES, { filter: (structure) => {
                return filter_structure(structure, sr);
            } });
        return resultstructure;
    }
    /* 房间建筑执行任务 */
    structureMission(strus) {
        var AllStructures = this.getTypeStructure(strus);
        for (var stru of AllStructures) {
            if (stru.ManageMission)
                stru.ManageMission();
        }
    }
    /**
    * 建筑任务初始化 目前包含terminal factory link
    */
    StructureMission() {
        let structures = [];
        var IdData = this.memory.StructureIdData;
        if (IdData.terminalID) {
            let terminal = Game.getObjectById(IdData.terminalID);
            if (!terminal) {
                delete IdData.terminalID;
            }
            else
                structures.push(terminal);
        }
        if (IdData.FactoryId) {
            let factory = Game.getObjectById(IdData.FactoryId);
            if (!factory) {
                delete IdData.FactoryId;
            }
            else
                structures.push(factory);
        }
        if (IdData.center_link) {
            let center_link = Game.getObjectById(IdData.center_link);
            if (!center_link) {
                delete IdData.center_link;
            }
            else
                structures.push(center_link);
        }
        if (IdData.source_links && IdData.source_links.length > 0) {
            for (var s of IdData.source_links) {
                let sl = Game.getObjectById(s);
                if (!sl) {
                    var index = IdData.source_links.indexOf(s);
                    IdData.source_links.splice(index, 1);
                }
                else
                    structures.push(sl);
            }
        }
        if (IdData.comsume_link && IdData.comsume_link.length > 0) {
            for (var s of IdData.comsume_link) {
                let sl = Game.getObjectById(s);
                if (!sl) {
                    var index = IdData.comsume_link.indexOf(s);
                    IdData.comsume_link.splice(index, 1);
                }
                else
                    structures.push(sl);
            }
        }
        if (structures.length > 0) {
            for (var obj of structures) {
                if (obj.ManageMission) {
                    obj.ManageMission();
                }
            }
        }
    }
    /* 获取全局建筑对象变量 由于该对象每tick都不一样，所以需要每tick都获取 */
    GlobalStructure() {
        // 目前只支持 storage terminal factory powerspawn 
        if (!global.Stru)
            global.Stru = {};
        if (!global.Stru[this.name])
            global.Stru[this.name] = {};
        if (this.memory.StructureIdData.storageID) {
            global.Stru[this.name]['storage'] = Game.getObjectById(this.memory.StructureIdData.storageID);
            if (!global.Stru[this.name]['storage']) {
                delete this.memory.StructureIdData.storageID;
            }
        }
        if (this.memory.StructureIdData.terminalID) {
            global.Stru[this.name]['terminal'] = Game.getObjectById(this.memory.StructureIdData.terminalID);
            if (!global.Stru[this.name]['terminal']) {
                delete this.memory.StructureIdData.terminalID;
            }
        }
        if (this.memory.StructureIdData.PowerSpawnID) {
            global.Stru[this.name]['powerspawn'] = Game.getObjectById(this.memory.StructureIdData.PowerSpawnID);
            if (!global.Stru[this.name]['powerspawn']) {
                delete this.memory.StructureIdData.PowerSpawnID;
            }
        }
        if (this.memory.StructureIdData.FactoryId) {
            global.Stru[this.name]['factory'] = Game.getObjectById(this.memory.StructureIdData.FactoryId);
            if (!global.Stru[this.name]['factory']) {
                delete this.memory.StructureIdData.FactoryId;
            }
        }
        if (this.memory.StructureIdData.NtowerID) {
            global.Stru[this.name]['Ntower'] = Game.getObjectById(this.memory.StructureIdData.NtowerID);
            if (!global.Stru[this.name]['Ntower']) {
                delete this.memory.StructureIdData.NtowerID;
            }
        }
        if (this.memory.StructureIdData.AtowerID && this.memory.StructureIdData.AtowerID.length > 0) {
            var otlist = global.Stru[this.name]['Atower'] = [];
            for (var ti of this.memory.StructureIdData.OtowerID) {
                var ot = Game.getObjectById(ti);
                if (!ot) {
                    var index = this.memory.StructureIdData.OtowerID.indexOf(ti);
                    this.memory.StructureIdData.OtowerID.splice(index, 1);
                    continue;
                }
                otlist.push(ot);
            }
        }
    }
    /* 等级信息更新 */
    LevelMessageUpdate() {
        if (this.controller.level > this.memory.originLevel)
            this.memory.originLevel = this.controller.level;
    }
}

/* 图标 */
/* dev布局信息 */
const devPlanConstant = [
    /* 2级规划 */
    { x: -1, y: 3, structureType: 'extension', level: 2 },
    { x: -2, y: 3, structureType: 'extension', level: 2 },
    { x: -3, y: 3, structureType: 'extension', level: 2 },
    { x: -2, y: 4, structureType: 'extension', level: 2 },
    { x: -3, y: 4, structureType: 'extension', level: 2 },
    { x: -1, y: 2, structureType: 'road', level: 2 },
    { x: 1, y: 2, structureType: 'road', level: 2 },
    { x: 0, y: 2, structureType: 'road', level: 2 },
    { x: -1, y: 1, structureType: 'road', level: 2 },
    { x: -2, y: 1, structureType: 'road', level: 2 },
    { x: -3, y: 0, structureType: 'road', level: 2 },
    { x: -2, y: -1, structureType: 'road', level: 2 },
    { x: -1, y: -2, structureType: 'road', level: 2 },
    { x: -1, y: -1, structureType: 'road', level: 2 },
    { x: 0, y: -3, structureType: 'road', level: 2 },
    { x: 1, y: -2, structureType: 'road', level: 2 },
    { x: 1, y: -1, structureType: 'road', level: 2 },
    { x: 2, y: -1, structureType: 'road', level: 2 },
    { x: 3, y: 0, structureType: 'road', level: 2 },
    { x: 2, y: 1, structureType: 'road', level: 2 },
    /* 3级规划 */
    { x: -4, y: 3, structureType: 'extension', level: 3 },
    { x: -4, y: 2, structureType: 'extension', level: 3 },
    { x: -3, y: 1, structureType: 'extension', level: 3 },
    { x: -3, y: 2, structureType: 'extension', level: 3 },
    { x: -3, y: -1, structureType: 'extension', level: 3 },
    { x: -2, y: 2, structureType: 'tower', level: 3 },
    { x: 0, y: 3, structureType: 'road', level: 3 },
    { x: 1, y: 1, structureType: 'road', level: 3 },
    { x: -1, y: 4, structureType: 'road', level: 3 },
    { x: -2, y: 5, structureType: 'road', level: 3 },
    { x: -3, y: 5, structureType: 'road', level: 3 },
    { x: -4, y: 4, structureType: 'road', level: 3 },
    { x: -5, y: 3, structureType: 'road', level: 3 },
    { x: -5, y: 2, structureType: 'road', level: 3 },
    { x: -4, y: 1, structureType: 'road', level: 3 },
    /* 4级规划 */
    { x: -2, y: -3, structureType: 'extension', level: 4 },
    { x: -2, y: -4, structureType: 'extension', level: 4 },
    { x: -3, y: -2, structureType: 'extension', level: 4 },
    { x: -3, y: -3, structureType: 'extension', level: 4 },
    { x: -3, y: -4, structureType: 'extension', level: 4 },
    { x: -4, y: 0, structureType: 'extension', level: 4 },
    { x: -4, y: -2, structureType: 'extension', level: 4 },
    { x: -4, y: -3, structureType: 'extension', level: 4 },
    { x: -5, y: 0, structureType: 'extension', level: 4 },
    { x: -5, y: -1, structureType: 'extension', level: 4 },
    { x: 0, y: 0, structureType: 'storage', level: 4 },
    { x: -4, y: -1, structureType: 'road', level: 4 },
    { x: -5, y: -2, structureType: 'road', level: 4 },
    { x: -5, y: -3, structureType: 'road', level: 4 },
    { x: -4, y: -4, structureType: 'road', level: 4 },
    { x: -3, y: -5, structureType: 'road', level: 4 },
    { x: -2, y: -5, structureType: 'road', level: 4 },
    { x: -1, y: -4, structureType: 'road', level: 4 },
    /* 5级规划 */
    { x: -5, y: 1, structureType: 'extension', level: 5 },
    { x: 1, y: -3, structureType: 'extension', level: 5 },
    { x: 2, y: -3, structureType: 'extension', level: 5 },
    { x: 2, y: -4, structureType: 'extension', level: 5 },
    { x: 3, y: -3, structureType: 'extension', level: 5 },
    { x: 3, y: -4, structureType: 'extension', level: 5 },
    { x: 3, y: -2, structureType: 'extension', level: 5 },
    { x: 3, y: -1, structureType: 'extension', level: 5 },
    { x: 4, y: -2, structureType: 'extension', level: 5 },
    { x: 4, y: -3, structureType: 'extension', level: 5 },
    { x: 1, y: 0, structureType: 'link', level: 5 },
    { x: -2, y: -2, structureType: 'tower', level: 5 },
    { x: 1, y: -4, structureType: 'road', level: 5 },
    { x: 2, y: -5, structureType: 'road', level: 5 },
    { x: 3, y: -5, structureType: 'road', level: 5 },
    { x: 4, y: -4, structureType: 'road', level: 5 },
    { x: 5, y: -3, structureType: 'road', level: 5 },
    { x: 5, y: -2, structureType: 'road', level: 5 },
    { x: 4, y: -1, structureType: 'road', level: 5 },
    // 6级规划
    { x: 1, y: 4, structureType: 'road', level: 6 },
    { x: 2, y: 3, structureType: 'road', level: 6 },
    { x: 3, y: 2, structureType: 'road', level: 6 },
    { x: 4, y: 1, structureType: 'road', level: 6 },
    { x: 5, y: 1, structureType: 'road', level: 6 },
    { x: 6, y: 0, structureType: 'road', level: 6 },
    { x: 1, y: 4, structureType: 'road', level: 6 },
    { x: 6, y: -1, structureType: 'road', level: 6 },
    { x: 1, y: 4, structureType: 'road', level: 6 },
    { x: 1, y: 4, structureType: 'road', level: 6 },
    { x: 3, y: 3, structureType: 'road', level: 6 },
    { x: 4, y: 4, structureType: 'road', level: 6 },
    { x: 5, y: 5, structureType: 'road', level: 6 },
    { x: 4, y: 6, structureType: 'road', level: 6 },
    { x: 3, y: 6, structureType: 'road', level: 6 },
    { x: 2, y: 6, structureType: 'road', level: 6 },
    { x: 1, y: 5, structureType: 'road', level: 6 },
    { x: 6, y: 4, structureType: 'road', level: 6 },
    { x: 6, y: 3, structureType: 'road', level: 6 },
    { x: 6, y: 2, structureType: 'road', level: 6 },
    { x: 2, y: 2, structureType: 'terminal', level: 6 },
    { x: -1, y: -3, structureType: 'extension', level: 6 },
    { x: -1, y: -5, structureType: 'extension', level: 6 },
    { x: 1, y: -5, structureType: 'extension', level: 6 },
    { x: 0, y: -4, structureType: 'extension', level: 6 },
    { x: 4, y: 0, structureType: 'extension', level: 6 },
    { x: 5, y: 0, structureType: 'extension', level: 6 },
    { x: 5, y: -1, structureType: 'extension', level: 6 },
    { x: -5, y: 5, structureType: 'extension', level: 6 },
    { x: -5, y: 4, structureType: 'extension', level: 6 },
    { x: -4, y: 5, structureType: 'extension', level: 6 },
    { x: 2, y: 4, structureType: 'lab', level: 6 },
    { x: 3, y: 4, structureType: 'lab', level: 6 },
    { x: 3, y: 5, structureType: 'lab', level: 6 },
    /* 7级规划 */
    { x: 4, y: 2, structureType: 'lab', level: 7 },
    { x: 4, y: 3, structureType: 'lab', level: 7 },
    { x: 5, y: 3, structureType: 'lab', level: 7 },
    { x: 2, y: -2, structureType: 'tower', level: 7 },
    { x: 0, y: -2, structureType: 'spawn', level: 7 },
    { x: -3, y: 6, structureType: 'extension', level: 7 },
    { x: -2, y: 6, structureType: 'extension', level: 7 },
    { x: 0, y: 4, structureType: 'extension', level: 7 },
    { x: -1, y: 5, structureType: 'extension', level: 7 },
    { x: 0, y: 5, structureType: 'extension', level: 7 },
    { x: 1, y: 6, structureType: 'extension', level: 7 },
    { x: -6, y: 2, structureType: 'extension', level: 7 },
    { x: -6, y: 3, structureType: 'extension', level: 7 },
    { x: -4, y: -5, structureType: 'extension', level: 7 },
    { x: -5, y: -4, structureType: 'extension', level: 7 },
    { x: -1, y: 6, structureType: 'road', level: 7 },
    { x: 0, y: 6, structureType: 'road', level: 7 },
    { x: -4, y: 6, structureType: 'road', level: 7 },
    { x: -5, y: 6, structureType: 'road', level: 7 },
    { x: -6, y: 5, structureType: 'road', level: 7 },
    { x: -6, y: 4, structureType: 'road', level: 7 },
    { x: -6, y: 1, structureType: 'road', level: 7 },
    { x: -6, y: 0, structureType: 'road', level: 7 },
    { x: -6, y: -1, structureType: 'road', level: 7 },
    { x: -6, y: -4, structureType: 'road', level: 7 },
    { x: -6, y: -5, structureType: 'road', level: 7 },
    { x: 6, y: -5, structureType: 'road', level: 8 },
    { x: 1, y: 3, structureType: 'factory', level: 7 },
    /* 8级规划 */
    { x: 4, y: -6, structureType: 'road', level: 8 },
    { x: 5, y: -6, structureType: 'road', level: 8 },
    { x: 0, y: -6, structureType: 'road', level: 8 },
    { x: 1, y: -6, structureType: 'road', level: 8 },
    { x: -1, y: -6, structureType: 'road', level: 8 },
    { x: -4, y: -6, structureType: 'road', level: 8 },
    { x: -5, y: -6, structureType: 'road', level: 8 },
    { x: 5, y: -4, structureType: 'extension', level: 8 },
    { x: 5, y: -5, structureType: 'extension', level: 8 },
    { x: 4, y: -5, structureType: 'extension', level: 8 },
    { x: -5, y: -5, structureType: 'extension', level: 8 },
    { x: -6, y: -2, structureType: 'extension', level: 8 },
    { x: -6, y: -3, structureType: 'extension', level: 8 },
    { x: 6, y: -2, structureType: 'extension', level: 8 },
    { x: 6, y: -3, structureType: 'extension', level: 8 },
    { x: 2, y: -6, structureType: 'extension', level: 8 },
    { x: 3, y: -6, structureType: 'extension', level: 8 },
    { x: 3, y: 1, structureType: STRUCTURE_NUKER, level: 8 },
    { x: 6, y: 1, structureType: STRUCTURE_OBSERVER, level: 8 },
    { x: -2, y: 0, structureType: STRUCTURE_SPAWN, level: 8 },
    { x: 2, y: 0, structureType: STRUCTURE_POWER_SPAWN, level: 8 },
    { x: 0, y: 1, structureType: STRUCTURE_TOWER, level: 8 },
    { x: 0, y: -1, structureType: STRUCTURE_TOWER, level: 8 },
    { x: -1, y: 0, structureType: STRUCTURE_TOWER, level: 8 },
    { x: 2, y: 5, structureType: 'lab', level: 8 },
    { x: 4, y: 5, structureType: 'lab', level: 8 },
    { x: 5, y: 2, structureType: 'lab', level: 8 },
    { x: 5, y: 4, structureType: 'lab', level: 8 },
];

/* 房间原型拓展   --内核  --房间生态 */
class RoomCoreEcosphereExtension extends Room {
    /* 房间生态主函数 */
    RoomEcosphere() {
        this.RoomState(); // 房间状态监测
        this.RoomPlan(); // 房间布局及自动修复
    }
    /* 自动布局 */
    RoomPlan() {
        // 没有中心点不进行自动布局
        let centerList = Memory.RoomControlData[this.name].center;
        if (!centerList || centerList.length < 2)
            return;
        let level = this.controller.level;
        if (level > this.memory.originLevel) {
            let LayOutPlan = Memory.RoomControlData[this.name].arrange;
            switch (LayOutPlan) {
                case 'man': {
                    break;
                }
                case 'hoho': {
                    break;
                }
                case 'dev': {
                    this.RoomRuleLayout(level, devPlanConstant);
                    break;
                }
            }
            /* link */
            if (level == 5) // 5级1个source的Link
             {
                let sourceIDs = this.memory.StructureIdData.source;
                if (sourceIDs.length <= 0)
                    return;
                let source = Game.getObjectById(sourceIDs[0]);
                let points = source.pos.getSourceLinkVoid();
                if (points.length <= 0)
                    return;
                LoopA: for (var i of points) {
                    if (i.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0 && i.lookFor(LOOK_STRUCTURES).length <= 0) {
                        i.createConstructionSite(STRUCTURE_LINK);
                        break LoopA;
                    }
                }
            }
            else if (level == 6) // 6级出控制器Link 便于冲级
             {
                let controller = this.controller;
                let points = controller.pos.getSourceLinkVoid();
                if (points.length <= 0)
                    return;
                LoopA: for (let i of points) {
                    if (i.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0 && i.lookFor(LOOK_STRUCTURES).length <= 0) {
                        i.createConstructionSite(STRUCTURE_LINK);
                        break LoopA;
                    }
                }
            }
            else if (level == 7) // 7级出source的Link
             {
                let sourceIDs = this.memory.StructureIdData.source;
                if (sourceIDs.length <= 1)
                    return;
                let source = Game.getObjectById(sourceIDs[1]);
                let points = source.pos.getSourceLinkVoid();
                if (points.length <= 0)
                    return;
                LoopA: for (var i of points) {
                    if (i.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0 && i.lookFor(LOOK_STRUCTURES).length <= 0) {
                        i.createConstructionSite(STRUCTURE_LINK);
                        break LoopA;
                    }
                }
            }
        }
        /* 自动重建 */
        if (Game.shard.name == 'shard3') {
            if (Game.time % 25)
                return;
        }
        else {
            if (Game.time % 5)
                return;
        }
        if (this.memory.state == 'peace') {
            /* cpu过少就不进行自动重建 */
            if (Game.cpu.bucket < 4000)
                return;
            /* 仅仅在和平情况下才会打开自动重建 */
            // 寻找所有属于我的建筑的数量 -1是去除controller 包含所有非控制器的我方建筑、我方建筑工地、该房间内的道路，container
            let currentNum = this.find(FIND_MY_STRUCTURES).length + this.find(FIND_MY_CONSTRUCTION_SITES).length + this.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_ROAD; } }).length - 1;
            if (!this.memory.structureNum)
                this.memory.structureNum = 0;
            this.memory.structureNum = this.getDistributionNum();
            if (currentNum > this.memory.structureNum) {
                this.addStructureMemory();
                console.log(`房间${this.name} 更新distribution记忆! 检测到建筑:${currentNum}, memory中建筑数量:${this.memory.structureNum}`);
            }
            else if (currentNum === this.memory.structureNum) {
                return;
            }
            else {
                console.log(this.name, `房间${this.name} 检测出缺损  检测到建筑:${currentNum}, memory中建筑数量:${this.memory.structureNum}`);
                /* 运行修补函数 */
                this.repatchDistribution();
            }
        }
        else if (this.memory.state == 'war') {
            /* 战争状态 */
            // 仅检测城墙、spawn、仓库、终端、实验室的数量，检测到缺损就自动开启安全模式
            let currentNum = this.find(FIND_MY_STRUCTURES, { filter: (structure) => {
                    return isInArray(['rampart', 'spawn', 'storage', 'terminal', 'lab', 'extension'], structure.structureType);
                } }).length;
            currentNum += this.find(FIND_MY_CONSTRUCTION_SITES, { filter: (cons) => {
                    return isInArray(['rampart', 'spawn', 'storage', 'terminal', 'lab', 'extension'], cons.structureType);
                } }).length;
            let memoryNum = 0;
            console.log('currentNum:', currentNum);
            for (var index in this.memory.distribution) {
                if (isInArray(['rampart', 'spawn', 'storage', 'terminal', 'lab', 'extension'], index)) {
                    memoryNum += this.memory.distribution[index].length;
                }
            }
            console.log("memoryNum:", memoryNum);
            if (currentNum < memoryNum) {
                /* 说明出问题了 */
                this.controller.activateSafeMode();
            }
        }
    }
    /* 房间状态 */
    RoomState() {
        // 每10tick观察一次房间状态，如果发现敌人，房间状态变为war，否则为peace
        if (Game.time % 10 == 0) {
            // 安全模式下和平模式
            if (this.controller.safeMode) {
                this.memory.state = 'peace';
                return;
            }
            var enemy = this.find(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                    return !isInArray(Memory.whitesheet, creep.owner.username);
                } });
            var enemyPowerCreep = this.find(FIND_HOSTILE_POWER_CREEPS, { filter: (creep) => {
                    return !isInArray(Memory.whitesheet, creep.owner.username);
                } });
            if (enemy[0] || enemyPowerCreep[0])
                this.memory.state = 'war';
            else
                this.memory.state = 'peace';
        }
    }
    /* 房间自动布局 */
    RoomRuleLayout(level, map) {
        let center_point = null;
        let centerList = Memory.RoomControlData[this.name].center;
        center_point = new RoomPosition(centerList[0], centerList[1], this.name);
        for (let obj of map) {
            if (level >= obj.level) {
                let new_point = new RoomPosition(center_point.x + obj.x, center_point.y + obj.y, this.name);
                // 忽略越界位置
                if (new_point.x >= 49 || new_point.x <= 0 || new_point.y >= 49 || new_point.y <= 0)
                    continue;
                // 墙壁不建造东西
                if (new_point.lookFor(LOOK_TERRAIN)[0] == 'wall')
                    continue;
                let posOcp = false;
                let new_point_structures = new_point.lookFor(LOOK_STRUCTURES);
                if (new_point_structures.length > 0)
                    for (let j of new_point_structures) {
                        if (j.structureType != 'rampart')
                            posOcp = true;
                    }
                if (new_point && new_point.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0 && !posOcp) {
                    let result = new_point.createConstructionSite(obj.structureType);
                    if (result != 0) {
                        let str = Colorful$1(`房间${this.name}创建工地${obj.structureType}失败! 位置: x=${obj.x}|y=${obj.y}`, 'orange', false);
                        console.log(str);
                    }
                    else {
                        let str = Colorful$1(`房间${this.name}创建工地${obj.structureType}成功! 位置: x=${obj.x}|y=${obj.y}`, 'green', false);
                        console.log(str);
                    }
                }
            }
            else
                return; // 不遍历无关建筑
        }
    }
    /* 获取房间memory中distribution总数量 */
    getDistributionNum() {
        if (!this.memory.distribution)
            return 0;
        let result = 0;
        for (var i of Object.keys(this.memory.distribution)) {
            result += this.memory.distribution[i].length;
        }
        return result;
    }
    /* 遍历该房间内所有的可以建造、维修的construction site 或者 structure，将其添加进该房间的memory中 */
    addStructureMemory() {
        if (!this.memory.distribution)
            this.memory.distribution = {};
        // 获取所有的结构和工地
        var construction = [];
        var all_my_structure = this.find(FIND_MY_STRUCTURES, { filter: (structure) => {
                return structure.structureType != STRUCTURE_CONTROLLER;
            } });
        var all_spawn = this.find(FIND_MY_SPAWNS);
        for (var i of all_my_structure)
            construction.push(i);
        for (var n of all_spawn)
            construction.push(n);
        var all_road = this.find(FIND_STRUCTURES, { filter: (structure) => {
                return structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_CONTAINER;
            } });
        for (var j of all_road)
            construction.push(j);
        var all_construct = this.find(FIND_CONSTRUCTION_SITES, { filter: (structure) => {
                return structure.structureType != STRUCTURE_WALL;
            } });
        for (var m of all_construct)
            construction.push(m);
        for (var index of construction) {
            if (!this.memory.distribution[index.structureType])
                this.memory.distribution[index.structureType] = [];
            if (!isInArray(this.memory.distribution[index.structureType], `${index.pos.x}/${index.pos.y}`))
                this.memory.distribution[index.structureType].push(`${index.pos.x}/${index.pos.y}`);
        }
    }
    /* 修补函数，根据记忆将缺损的建筑进行自动工地规划 */
    repatchDistribution() {
        if (!this.memory.distribution)
            return;
        for (var key_ of Object.keys(this.memory.distribution)) {
            // key_ : road/spawn/storage....
            for (var po of this.memory.distribution[key_]) {
                var thisPos = this.unzip(po);
                if (thisPos) {
                    if (key_ != 'spawn') {
                        if (thisPos.createConstructionSite(key_) == 0) {
                            console.log(`自动修复成功，其建筑为${key_}，位置为${thisPos.x},${thisPos.y}`);
                        }
                    }
                    else {
                        thisPos.createConstructionSite(STRUCTURE_SPAWN);
                    }
                }
            }
        }
    }
    // 解压房间内字符串获取pos对象
    unzip(str) {
        var info = str.split('/');
        return info.length == 2 ? new RoomPosition(Number(info[0]), Number(info[1]), this.name) : undefined;
    }
    /* 解绑函数，删除memory中指定的数据 */
    unbindMemory(mold, x, y) {
        var thisPosition = new RoomPosition(x, y, this.name);
        if (thisPosition.lookFor(LOOK_STRUCTURES).length == 0 && thisPosition.lookFor(LOOK_CONSTRUCTION_SITES).length == 0) {
            console.log(`房间${this.name}的位置x:${thisPosition.x},y:${thisPosition.y}无任何建筑或工地！`);
            return;
        }
        var result = [];
        for (var i of thisPosition.lookFor(LOOK_STRUCTURES))
            result.push(i);
        for (var j of thisPosition.lookFor(LOOK_CONSTRUCTION_SITES))
            result.push(j);
        for (var sample of result) {
            if (sample.structureType === mold) {
                // 在记忆列表中删除指定的数据，并删除该位置的建筑或工地
                if (!this.memory.distribution[mold])
                    return;
                if (this.memory.distribution[mold].length <= 0)
                    return;
                for (var poStr of this.memory.distribution[mold]) {
                    if (poStr == `${x}/${y}`) {
                        var index = this.memory.distribution[mold].indexOf(poStr);
                        if (index > -1) {
                            this.memory.distribution[mold].splice(index, 1);
                        }
                    }
                }
                if (sample.destroy)
                    sample.destroy();
                else if (sample.remove)
                    sample.remove();
                return;
            }
        }
        console.log(`房间${this.name}的位置x:${thisPosition.x},y:${thisPosition.y}不存在${mold}类型建筑或结构！`);
    }
}

/* 房间原型拓展   --任务  --任务框架 */
class RoomMissonFrameExtension extends Room {
    /* 任务管理器 */
    MissionManager() {
        // 冷却监测
        this.CoolDownCaculator();
        // 超时监测
        this.DelayCaculator();
        // 任务-爬虫 绑定信息更新
        this.UnbindMonitor();
        // 任务-爬虫 孵化
        this.MissonRoleSpawn();
        /* PC任务管理器 */
        this.PowerCreep_TaskManager();
        /* [全自动] 任务挂载区域 需要按照任务重要程度进行排序 */
        this.Spawn_Feed(); // 虫卵填充任务 
        this.Task_CenterLink(); // 能量采集  
        this.Task_ComsumeLink(); // 消费、冲级link
        this.Constru_Build(); // 建筑任务
        this.Task_Clink(); // 链接送仓任务
        this.Tower_Feed(); // 防御塔填充任务
        this.Lab_Feed(); // 实验室填充\回收任务  
        this.Nuker_Feed(); // 核弹填充任务      
        this.Nuke_Defend(); // 核弹防御
        this.Task_CompoundDispatch(); // 合成规划 （中级）
        this.Task_monitorMineral(); // 挖矿
        this.Task_montitorPower(); // 烧power任务监控
        this.Task_Auto_Defend(); // 主动防御任务发布
        /* 基本任务监控区域 */
        for (var index in this.memory.Misson)
            for (var misson of this.memory.Misson[index]) {
                A: switch (misson.name) {
                    case "物流运输": {
                        this.Task_Carry(misson);
                        break A;
                    }
                    case "墙体维护": {
                        this.Task_Repair(misson);
                        break A;
                    }
                    case '黄球拆迁': {
                        this.Task_dismantle(misson);
                        break A;
                    }
                    case '急速冲级': {
                        this.Task_Quick_upgrade(misson);
                        break A;
                    }
                    case '紧急援建': {
                        this.Task_HelpBuild(misson);
                        break A;
                    }
                    case '紧急支援': {
                        this.Task_HelpDefend(misson);
                        break A;
                    }
                    case '资源合成': {
                        this.Task_Compound(misson);
                        break A;
                    }
                    case '攻防一体': {
                        this.Task_aio(misson);
                        break A;
                    }
                    case '外矿开采': {
                        this.Task_OutMine(misson);
                        break A;
                    }
                    case "power升级": {
                        this.Task_ProcessPower(misson);
                        break A;
                    }
                    case '过道采集': {
                        this.Task_Cross(misson);
                        break A;
                    }
                    case 'power采集': {
                        this.Task_PowerHarvest(misson);
                        break A;
                    }
                    case '红球防御': {
                        this.Task_Red_Defend(misson);
                        break A;
                    }
                    case '蓝球防御': {
                        this.Task_Blue_Defend(misson);
                        break A;
                    }
                    case '双人防御': {
                        this.Task_Double_Defend(misson);
                        break A;
                    }
                    case '四人小队': {
                        this.Task_squad(misson);
                        break A;
                    }
                }
            }
    }
    /* 添加任务 */
    AddMission(mis) {
        if (!mis)
            return false;
        var Index;
        if (mis.range == 'Creep')
            Index = 'C-';
        else if (mis.range == 'Room')
            Index = 'R-';
        else if (mis.range == 'Structure')
            Index = 'S-';
        else if (mis.range == 'PowerCreep')
            Index = 'P-';
        else
            return;
        var tempID = Index + generateID();
        /* 最多允许同时有30个任务，超过则不能再挂载 */
        if (this.memory.Misson[mis.range] && this.memory.Misson[mis.range].length >= 30) {
            return false;
        }
        /* 超过了任务的最大重复数，也不允许挂载 默认是1*/
        var maxtime = mis.maxTime ? mis.maxTime : 1;
        if (mis.CreepBind) {
            /* 爬虫任务 */
            for (var c of Object.keys(mis.CreepBind)) {
                if (this.RoleMissionNum(c, mis.name) >= maxtime)
                    return false;
            }
        }
        else {
            /* 房间、建筑类型的任务 */
            let NowNum = this.MissionNum(mis.range, mis.name);
            if (NowNum >= maxtime) {
                return false;
            }
        }
        /* 如果该任务冷却时间不为0则不允许挂载 */
        if (this.memory.CoolDownDic[mis.name]) {
            return false;
        }
        mis.id = tempID;
        /* lab绑定相关，涉及lab的绑定和解绑 */
        if (mis.LabBind && Object.keys(mis.LabBind).length > 0) {
            for (var l in mis.LabBind) {
                if (!this.CheckLabType(l, mis.LabBind[l]) || !this.CheckLabOcc(l)) {
                    console.log(Colorful$1(`LabID:${l}绑定失败，请检查!`, 'red', true));
                    return false;
                }
            }
        }
        if (mis.LabBind === null)
            return false;
        /* 每种相同任务成功挂载一次，将有冷却时间 默认为10 */
        var coolTick = mis.cooldownTick ? mis.cooldownTick : 10;
        if (!this.memory.CoolDownDic[mis.name])
            this.memory.CoolDownDic[mis.name] = coolTick;
        mis.level ? mis.level : 10; // 任务等级默认为10
        // 挂载任务
        this.memory.Misson[mis.range].push(mis);
        this.memory.Misson[mis.range].sort(compare('level')); // 每次提交任务都根据优先级排列一下
        if (!isInArray(Memory.ignoreMissonName, mis.name))
            console.log(Colorful$1(`${mis.name} 任务挂载 √√√ ID:${mis.id} Room:${this.name}`, 'green'));
        /* 任务挂载成功才绑定实验室 */
        if (mis.LabBind && Object.keys(mis.LabBind).length > 0) {
            for (var ll in mis.LabBind) {
                this.BindLabData(ll, mis.LabBind[ll], mis.id);
            }
        }
        return true;
    }
    /* 删除任务 */
    DeleteMission(id) {
        var range;
        if (!id) {
            console.log("存在id异常! 发生在房间", this.name);
            return false;
        }
        if (id[0] == 'C')
            range = 'Creep';
        else if (id[0] == 'S')
            range = 'Structure';
        else if (id[0] == 'R')
            range = 'Room';
        else if (id[0] == 'P')
            range = 'PowerCreep';
        else
            return false;
        for (var m of this.memory.Misson[range]) {
            if (m.id == id) {
                /* 解绑lab */
                if (m.LabBind && Object.keys(m.LabBind).length > 0) {
                    for (var l in m.LabBind) {
                        // console.log('LabID: ',m.LabBind[l],'------解绑-------->MissonID: ',m.id)
                        this.UnBindLabData(l, m.id);
                    }
                }
                /* 解绑爬虫的任务 对于没有超时监测的任务，删除任务也要删除任务绑定的爬虫 */
                if (!m.reserve && m.CreepBind) {
                    for (var c in m.CreepBind)
                        for (var cc of m.CreepBind[c].bind) {
                            if (Game.creeps[cc]) {
                                /* 删除任务也意味着初始化任务数据内存 */
                                Game.creeps[cc].memory.MissionData = {};
                            }
                        }
                }
                /* 删除任务*/
                var index = this.memory.Misson[range].indexOf(m);
                this.memory.Misson[range].splice(index, 1);
                if (!isInArray(Memory.ignoreMissonName, m.name))
                    console.log(Colorful$1(`${m.name} 任务删除 xxx ID:${m.id} Room:${this.name}`, 'blue'));
                return true;
            }
        }
        console.log(Colorful$1(`任务删除失败 ID:${m.id} Name:${m.name} Room:${this.name}`, 'red'));
        return false;
    }
    /* 冷却计时器 */
    CoolDownCaculator() {
        if (!this.memory.CoolDownDic)
            this.memory.CoolDownDic = {};
        for (var i in this.memory.CoolDownDic) {
            if (this.memory.CoolDownDic[i] > 0)
                this.memory.CoolDownDic[i] -= 1;
            else
                delete this.memory.CoolDownDic[i];
        }
    }
    /* 超时计时器 */
    DelayCaculator() {
        for (var key in this.memory.Misson) {
            for (var i of this.memory.Misson[key]) {
                if (i.processing && i.delayTick < 99995)
                    i.delayTick--;
                if (i.delayTick <= 0) {
                    /* 小于0就删除任务 */
                    this.DeleteMission(i.id);
                }
            }
        }
    }
    /* 任务解绑监测 */
    UnbindMonitor() {
        /* 只适用于Creep任务 */
        if (Game.time % 5)
            return;
        if (!this.memory.Misson['Creep'])
            return;
        for (var m of this.memory.Misson['Creep']) {
            if (!m.CreepBind)
                continue;
            if (m.CreepBind && Object.keys(m.CreepBind).length > 0) {
                for (var r in m.CreepBind) {
                    for (var c of m.CreepBind[r].bind)
                        if (!Game.creeps[c]) {
                            //console.log(`已经清除爬虫${c}的绑定数据!`)
                            var index = m.CreepBind[r].bind.indexOf(c);
                            m.CreepBind[r].bind.splice(index, 1);
                        }
                }
            }
        }
    }
    /* 任务数量查询 */
    MissionNum(range, name) {
        if (!this.memory.Misson)
            this.memory.Misson = {};
        if (!this.memory.Misson[range])
            this.memory.Misson[range] = [];
        let n = 0;
        for (var i of this.memory.Misson[range]) {
            if (i.name == name) {
                n += 1;
            }
        }
        return n;
    }
    /* 与role相关的任务数量查询 */
    RoleMissionNum(role, name) {
        let n = 0;
        for (var i of this.memory.Misson['Creep']) {
            if (!i.CreepBind)
                continue;
            if (i.name == name && isInArray(Object.keys(i.CreepBind), role)) {
                n += 1;
            }
        }
        return n;
    }
    /* 获取任务 */
    GainMission(id) {
        for (var i in this.memory.Misson)
            for (var t of this.memory.Misson[i]) {
                if (t.id == id)
                    return t;
            }
        return null;
    }
    /* 通过名称获取唯一任务 */
    MissionName(range, name) {
        for (var i of this.memory.Misson[range]) {
            if (i.name == name) {
                return i;
            }
        }
        return null;
    }
    /* 判断实验室资源类型是否一致 */
    CheckLabType(id, rType) {
        if (!this.memory.RoomLabBind)
            this.memory.RoomLabBind = {};
        for (var i in this.memory.RoomLabBind) {
            if (i == id) {
                var thisLab = Game.getObjectById(i);
                if (!thisLab)
                    return false;
                if (thisLab.mineralType && thisLab.mineralType != rType) {
                    return false;
                }
                if (this.memory.RoomLabBind[i].rType != rType)
                    return false;
                return true;
            }
        }
        return true;
    }
    /* 判断是否允许新增 */
    CheckLabOcc(id) {
        if (!this.memory.RoomLabBind)
            this.memory.RoomLabBind = {};
        for (var i in this.memory.RoomLabBind) {
            if (i == id) {
                if (this.memory.RoomLabBind[i].occ)
                    return false;
                return true;
            }
        }
        return true;
    }
    /* 设置lab绑定数据 */
    BindLabData(id, rType, MissonID, occ) {
        for (var i in this.memory.RoomLabBind) {
            if (i == id) {
                if (this.memory.RoomLabBind[i].rType != rType)
                    return false;
                if (!isInArray(this.memory.RoomLabBind[i].missonID, MissonID)) {
                    this.memory.RoomLabBind[i].missonID.push(MissonID);
                    return true;
                }
            }
        }
        // 说明不存在该id
        this.memory.RoomLabBind[id] = { missonID: [MissonID], rType: rType, occ: occ ? occ : false };
        return true;
    }
    /* 解绑lab绑定数据 */
    UnBindLabData(id, MissonID) {
        for (var i in this.memory.RoomLabBind) {
            if (i == id) {
                if (this.memory.RoomLabBind[i].missonID.length <= 1) {
                    console.log('LabID: ', i, '------解绑-------->MissonID: ', MissonID);
                    delete this.memory.RoomLabBind[i];
                    return true;
                }
                else {
                    for (var j of this.memory.RoomLabBind[i].missonID) {
                        if (j == MissonID) {
                            console.log('LabID: ', i, '------解绑-------->MissonID: ', MissonID);
                            var index = this.memory.RoomLabBind[i].missonID.indexOf(MissonID);
                            this.memory.RoomLabBind[i].missonID.splice(index, 1);
                            return true;
                        }
                    }
                    return false;
                }
            }
        }
        return false;
    }
    /* 任务所需角色孵化管理 */
    MissonRoleSpawn() {
        if (!this.memory.Misson['Creep'])
            this.memory.Misson['Creep'] = [];
        for (var misson of this.memory.Misson['Creep']) {
            if (misson.CreepBind) {
                for (var role in misson.CreepBind) {
                    let memData = {};
                    if (RoleData[role].mem)
                        memData = RoleData[role].mem;
                    /* 间隔型 未测试 */
                    if (misson.CreepBind[role].interval) {
                        if (misson.CreepBind[role].num <= 0)
                            continue;
                        if (misson.CreepBind[role].interval <= 0)
                            continue;
                        /* 如果是间隔孵化型的爬虫角色 */
                        if (!misson.Data)
                            misson.Data = {};
                        if (!misson.Data.intervalTime)
                            misson.Data.intervalTime = Game.time;
                        if ((Game.time - misson.Data.intervalTime) % misson.CreepBind[role].interval == 0) {
                            /* 如果孵化队列里太多这种类型的爬虫就不孵化 最高允许10个 */
                            let n = 0;
                            for (var ii of this.memory.SpawnList) {
                                if (ii.role == role)
                                    n += 1;
                            }
                            if (n > 10)
                                continue;
                            memData["taskRB"] = misson.id;
                            for (let i = 0; i < misson.CreepBind[role].num; i++) {
                                this.SingleSpawn(role, RoleData[role].level ? RoleData[role].level : 10, memData);
                            }
                        }
                        continue;
                    }
                    /* 补全型 */
                    if (this.memory.state == 'war' && !RoleData[role].must)
                        continue; // 战争模式下非必要任务不运行
                    let spawnNum = misson.CreepBind[role].num - misson.CreepBind[role].bind.length;
                    if (spawnNum > 0 && !this.memory.SpawnConfig[role] && misson.Data.disShard != Game) {
                        /* 如果任务没招到爬，检查一下是否空闲爬 */
                        let relateSpawnList = this.SpawnListRoleNum(role);
                        let relateCreeps = _.filter(Game.creeps, (creep) => creep.memory.belong == this.name && creep.memory.role == role && (!creep.memory.MissionData || !creep.memory.MissionData.id)).length;
                        if (relateSpawnList + relateCreeps < spawnNum) {
                            this.SingleSpawn(role, RoleData[role].level ? RoleData[role].level : 10, memData);
                        }
                    }
                }
            }
        }
    }
    /* 判断lab的boost搬运模块 */
    Check_Lab(misson, role, tankType) {
        if (!misson.LabBind)
            return true;
        var id;
        if (tankType == 'storage') {
            if (!this.memory.StructureIdData.storageID)
                return false;
            id = this.memory.StructureIdData.storageID;
        }
        else if (tankType == 'terminal') {
            if (!this.memory.StructureIdData.terminalID)
                return false;
            id = this.memory.StructureIdData.terminalID;
        }
        var tank_ = Game.getObjectById(id);
        if (!tank_ && id)
            return false;
        // for (var i in misson.LabBind)
        // {
        //     if (!this.memory.ResourceLimit[misson.LabBind[i]])
        //     this.memory.ResourceLimit[misson.LabBind[i]] = 8000
        //     if (this.memory.ResourceLimit[misson.LabBind[i]] < 8000)
        //     this.memory.ResourceLimit[misson.LabBind[i]] = 8000
        // }
        /* 负责lab的填充 */
        for (var i in misson.LabBind) {
            var All_i_Num;
            if (tankType == 'complex') {
                var terminal = Game.getObjectById(this.memory.StructureIdData.terminalID);
                var storage = Game.getObjectById(this.memory.StructureIdData.storageID);
                if (!terminal || !storage) {
                    if (!terminal && storage)
                        tank_ = storage;
                    else if (terminal && !storage)
                        tank_ = terminal;
                    else
                        return false;
                }
                else {
                    var terminalNum = terminal.store.getUsedCapacity(misson.LabBind[i]);
                    var storageNum = storage.store.getUsedCapacity(misson.LabBind[i]);
                    tank_ = terminalNum > storageNum ? terminal : storage;
                }
            }
            if (!tank_)
                return false;
            All_i_Num = tank_.store.getUsedCapacity(misson.LabBind[i]);
            if (All_i_Num < 4000) {
                /* 资源调度 */
                if (DispatchNum(this.name) <= 0 && this.MissionNum('Structure', '资源购买') <= 0 && !checkSend(this.name, misson.LabBind[i])) {
                    console.log(Colorful$1(`[资源调度] 房间${this.name}没有足够的资源[${misson.LabBind[i]}],将执行资源调度!`, 'yellow'));
                    let dispatchTask = {
                        sourceRoom: this.name,
                        rType: misson.LabBind[i],
                        num: 3000,
                        delayTick: 200,
                        conditionTick: 20,
                        buy: true,
                        mtype: 'deal'
                    };
                    Memory.ResourceDispatchData.push(dispatchTask);
                }
                return;
            }
            var disLab = Game.getObjectById(i);
            if (!disLab)
                return false;
            if (disLab.store.getUsedCapacity(misson.LabBind[i]) < 1000 && this.Check_Carry('transport', tank_.pos, disLab.pos, misson.LabBind[i])) {
                if (All_i_Num < 1500)
                    return false;
                var roleData = {};
                roleData[role] = { num: 1, bind: [] };
                var carryTask = this.Public_Carry(roleData, 45, this.name, tank_.pos.x, tank_.pos.y, this.name, disLab.pos.x, disLab.pos.y, misson.LabBind[i], 2000);
                this.AddMission(carryTask);
                return false;
            }
        }
        return true;
    }
    /* 判断已经有了该类型的搬运任务 true:代表没有重复， false代表有 */
    Check_Carry(role, source, pos, rType) {
        for (let i of this.memory.Misson['Creep']) {
            if (!i.CreepBind)
                continue;
            if (i.name != '物流运输')
                continue;
            if (i.CreepBind[role] && i.Data.rType == rType) {
                let sourcePos = new RoomPosition(i.Data.sourcePosX, i.Data.sourcePosY, i.Data.sourceRoom);
                let disPos = new RoomPosition(i.Data.targetPosX, i.Data.targetPosY, i.Data.targetRoom);
                if (sourcePos.isEqualTo(source) && disPos.isEqualTo(pos))
                    return false;
            }
        }
        return true;
    }
    /* 判断是否已经有了该类型的link任务 true:代表没有重复 false代表有 */
    Check_Link(source, po) {
        let sourceLink = source.GetStructure('link');
        let posLink = po.GetStructure('link');
        if (!sourceLink || !posLink) {
            console.log(`${this.name}出现check_link错误!`);
            return false;
        }
        for (let i of this.memory.Misson['Structure']) {
            if (i.name == "链传送能" && isInArray(i.structure, sourceLink.id) && i.Data.disStructure == posLink.id) {
                return false;
            }
        }
        return true;
    }
    // 判断房间是否存在资源购买指定资源的任务
    Check_Buy(resource) {
        for (let i of this.memory.Misson['Structure']) {
            if (i.name == '资源购买' && i.Data.rType == resource)
                return true;
        }
        return false;
    }
}

/* 房间原型拓展   --任务  --任务发布便捷函数 */
class RoomMissonPublish extends Room {
    /**
     * 搬运任务发布函数
     * @param creepData 爬虫绑定信息，例如：{'repair':{num:1,bind:[]},'build':{num:2,bind:[]}}
     * @param delayTick 任务的超时时间，如果不想设置超时可以设置为99999
     * @param sR        提取资源的建筑所在房间
     * @param sX        提取资源的建筑X坐标
     * @param sY        提取资源的建筑Y坐标
     * @param tR        存放资源的建筑所在房间
     * @param tX        存放资源的建筑X坐标
     * @param tY        存放资源的建筑Y坐标
     * @param rType     资源类型[可选] 例如： 'energy' 或者 'XLH2O'等
     * @param num       要搬运的数量[可选]
     * @returns         任务对象
     */
    Public_Carry(creepData, delayTick, sR, sX, sY, tR, tX, tY, rType, num) {
        var thisTask = {
            name: '物流运输',
            CreepBind: creepData,
            range: 'Creep',
            delayTick: delayTick,
            cooldownTick: 1,
            maxTime: 3,
            Data: {
                sourceRoom: sR,
                sourcePosX: sX,
                sourcePosY: sY,
                targetRoom: tR,
                targetPosX: tX,
                targetPosY: tY,
            }
        };
        if (rType)
            thisTask.Data.rType = rType;
        if (num)
            thisTask.Data.num = num;
        return thisTask;
    }
    /**
     * 修墙任务的发布函数
     * @param Rtype     维修范围： global->全局维修 special->黄黑旗下建筑维修 nuker->核弹防御
     * @param num       任务相关维修爬数量
     * @param boostType boost类型 null->无boost LH/LH2O/XLH2O是boost类型
     * @param vindicate 是否减少爬虫部件(一般用于正常维护，而非战时)
     * @returns         任务对象
     */
    public_repair(Rtype, num, boostType, vindicate) {
        var thisTask = {
            name: '墙体维护',
            range: 'Creep',
            delayTick: 99999,
            level: 10,
            Data: {
                RepairType: Rtype,
                num: num,
                boostType: boostType,
                vindicate: vindicate
            },
            maxTime: 3
        };
        thisTask.CreepBind = { 'repair': { num: num, bind: [] } };
        if (boostType == 'LH') {
            var labData = this.Bind_Lab(['LH']);
            if (labData === null)
                return null;
            thisTask.LabBind = labData;
        }
        else if (boostType == 'LH2O') {
            var labData = this.Bind_Lab(['LH2O']);
            if (labData === null)
                return null;
            thisTask.LabBind = labData;
        }
        else if (boostType == 'XLH2O') {
            var labData = this.Bind_Lab(['XLH2O']);
            if (labData === null)
                return null;
            thisTask.LabBind = labData;
        }
        thisTask.maxTime = 3;
        return thisTask;
    }
    /**
     *                  C计划 即占领一个房间开启安全模式，建造wall，保护主房
     * @param disRoom   目标房间
     * @returns         任务对象
     */
    public_planC(disRoom, Cnum, upNum, shard) {
        var thisTask = {
            name: 'C计划',
            range: 'Creep',
            delayTick: 20500,
            level: 10,
            Data: {
                state: 0,
                disRoom: disRoom,
            },
        };
        thisTask.reserve = true;
        if (!shard) {
            thisTask.Data.shard = Game.shard.name;
            thisTask.CreepBind = { 'cclaim': { num: Cnum, bind: [] }, 'cupgrade': { num: upNum, bind: [] } };
        }
        else {
            thisTask.Data.shard = shard;
            thisTask.CreepBind = { 'cclaim': { num: Cnum, bind: [], interval: 1000 }, 'cupgrade': { num: upNum, bind: [], interval: 1000 } };
        }
        return thisTask;
    }
    /**
     *                  link传任务发布函数
     * @param structure 传送的link
     * @param dislink   目的link
     * @param level     传送任务等级
     * @param delayTick 过期时间
     * @returns         任务对象
     */
    Public_link(structure, dislink, level, delayTick) {
        var thisTask = {
            name: '链传送能',
            range: 'Structure',
            delayTick: 20,
            structure: structure,
            level: level,
            Data: {
                disStructure: dislink
            }
        };
        if (delayTick)
            thisTask.delayTick = delayTick;
        return thisTask;
    }
    /**
     *                  拆迁任务发布函数
     * @param disRoom   目标房间
     * @param num       数量
     * @param interval  时间间隔
     * @param boost     是否boost
     * @returns         任务对象
     */
    Public_dismantle(disRoom, num, interval, boost) {
        var thisTask = {
            name: '黄球拆迁',
            range: 'Creep',
            delayTick: 20500,
            level: 10,
            Data: {
                disRoom: disRoom,
                num: num
            },
        };
        thisTask.reserve = true;
        if (this.controller.level <= 5)
            thisTask.Data.boost = false;
        if (boost) {
            thisTask.Data.boost = true;
            thisTask.LabBind = this.Bind_Lab(['XZHO2', 'XZH2O']);
        }
        thisTask.CreepBind = { 'dismantle': { num: 0, interval: interval ? interval : 1200, bind: [] } };
        return thisTask;
    }
    Public_aio(disRoom, disShard, num, interval, boost) {
        var thisTask = {
            name: '攻防一体',
            range: 'Creep',
            delayTick: 80000,
            level: 10,
            Data: {
                disRoom: disRoom,
                num: num,
                shard: disShard,
            },
        };
        if (boost) {
            thisTask.Data.boost = true;
            thisTask.LabBind = this.Bind_Lab(['XZHO2', 'XGHO2', 'XLHO2', 'XKHO2']);
        }
        else
            thisTask.Data.boost = false;
        thisTask.CreepBind = { 'aio': { num: 0, interval: interval, bind: [] } };
        thisTask.reserve = true;
        return thisTask;
    }
    Public_control(disRoom, shard, interval) {
        var thisTask = {
            name: '控制攻击',
            range: 'Creep',
            delayTick: 99999,
            level: 10,
            Data: {
                disRoom: disRoom,
                shard: shard,
            },
        };
        thisTask.reserve = true;
        thisTask.CreepBind = { 'claim-attack': { num: 1, interval: interval, bind: [] } };
        return thisTask;
    }
    /**
     *                  急速冲级任务发布函数
     * @param num       冲级爬数量
     * @param boostType boost类型
     * @returns         任务对象
     */
    Public_quick(num, boostType) {
        var thisTask = {
            name: '急速冲级',
            range: 'Creep',
            delayTick: 99999,
            level: 10,
            Data: {},
        };
        thisTask.CreepBind = { 'rush': { num: num, bind: [] } };
        if (boostType) {
            thisTask.LabBind = this.Bind_Lab([boostType]);
        }
        return thisTask;
    }
    Public_expand(disRoom, num, cnum) {
        var thisTask = {
            name: '扩张援建',
            range: 'Creep',
            delayTick: 40000,
            level: 10,
            Data: {
                disRoom: disRoom
            },
        };
        thisTask.reserve = true;
        thisTask.CreepBind = {
            'claim': { num: cnum, bind: [] },
            'Ebuild': { num: num, bind: [] },
            'Eupgrade': { num: num, bind: [] }
        };
        return thisTask;
    }
    Public_helpBuild(disRoom, num, shard, time) {
        var thisTask = {
            name: '紧急援建',
            range: 'Creep',
            delayTick: 20000,
            level: 10,
            Data: {
                disRoom: disRoom,
                num: num,
                shard: shard ? shard : Game.shard.name
            },
            maxTime: 2
        };
        thisTask.reserve = true;
        thisTask.CreepBind = {
            'architect': { num: num, bind: [], interval: time ? time : 1000 },
        };
        thisTask.LabBind = this.Bind_Lab(['XZHO2', 'XLH2O', 'XLHO2', 'XGHO2', 'XKH2O']);
        if (thisTask.LabBind)
            return thisTask;
        return null;
    }
    Public_support(disRoom, sType, shard) {
        var thisTask = {
            name: '紧急支援',
            range: 'Creep',
            delayTick: 20000,
            level: 10,
            Data: {
                disRoom: disRoom,
                sType: sType,
            },
            maxTime: 3
        };
        thisTask.reserve = true;
        if (sType == 'double') {
            thisTask.CreepBind = { 'double-attack': { num: 1, bind: [] }, 'double-heal': { num: 1, bind: [] } };
            thisTask.LabBind = this.Bind_Lab(['XUH2O', 'XLHO2', 'XZHO2', 'XGHO2']);
        }
        if (shard)
            thisTask.Data.shard = shard;
        else
            thisTask.Data.shard = Game.shard.name;
        return thisTask;
    }
    Public_Sign(disRoom, shard, str) {
        var thisTask = {
            name: '房间签名',
            range: 'Creep',
            delayTick: 1600,
            level: 10,
            Data: {
                disRoom: disRoom,
                shard: shard,
                str: str, // 签名内容
            },
            maxTime: 2 // 最大同时任务数量
        };
        thisTask.CreepBind = { 'scout': { num: 1, bind: [] } };
        return thisTask;
    }
    /* 资源传送任务发布函数 */
    Public_Send(disRoom, rType, num) {
        if (!this.memory.StructureIdData.terminalID)
            return null;
        var terminal = Game.getObjectById(this.memory.StructureIdData.terminalID);
        if (!terminal) {
            delete this.memory.StructureIdData.terminalID;
            return null;
        }
        var thisTask = {
            name: '资源传送',
            range: 'Structure',
            delayTick: 2500,
            structure: [terminal.id],
            level: 5,
            Data: {
                disRoom: disRoom,
                rType: rType,
                num: num
            },
            maxTime: 8
        };
        return thisTask;
    }
    /**
     *  资源购买任务发布函数 做多同时允许3个
     * @param res   要购买的资源
     * @param num   要购买的数量
     * @param range 价格波动可接受区间
     * @param max   最高接受的价格
     * @returns     任务对象
     */
    Public_Buy(res, num, range, max) {
        if (!this.memory.StructureIdData.terminalID)
            return null;
        var terminal = Game.getObjectById(this.memory.StructureIdData.terminalID);
        if (!terminal) {
            delete this.memory.StructureIdData.terminalID;
            return null;
        }
        /* 开始进行任务 */
        var thisTask = {
            name: '资源购买',
            range: 'Structure',
            structure: [terminal.id],
            delayTick: 60,
            level: 10,
            maxTime: 3,
            Data: {
                rType: res,
                num: num,
                range: range
            }
        };
        thisTask.Data.maxPrice = max ? max : 35;
        return thisTask;
    }
    public_Compound(num, disResource, bindData) {
        // 检验阶段
        if (!this.memory.StructureIdData.labInspect || Object.keys(this.memory.StructureIdData.labInspect).length < 3)
            return null;
        var raw1 = Game.getObjectById(this.memory.StructureIdData.labInspect.raw1);
        var raw2 = Game.getObjectById(this.memory.StructureIdData.labInspect.raw2);
        if (!raw1) {
            delete this.memory.StructureIdData.labInspect.raw1;
            return;
        }
        if (!raw2) {
            delete this.memory.StructureIdData.labInspect.raw2;
            return;
        }
        for (var i of this.memory.StructureIdData.labInspect.com) {
            var thisLab = Game.getObjectById(i);
            if (!thisLab) {
                var index = this.memory.StructureIdData.labInspect.com.indexOf(i);
                this.memory.StructureIdData.labInspect.com.splice(index, 1);
                continue;
            }
        }
        var raw1str = LabMap[disResource].raw1;
        var raw2str = LabMap[disResource].raw2;
        /* 开始进行任务 */
        var thisTask = {
            name: '资源合成',
            range: 'Room',
            delayTick: 50000,
            processing: true,
            level: 10,
            LabBind: {},
            Data: {
                num: num
            }
        };
        thisTask.LabBind[this.memory.StructureIdData.labInspect.raw1] = raw1str;
        thisTask.LabBind[this.memory.StructureIdData.labInspect.raw2] = raw2str;
        var BindData = bindData;
        thisTask.Data.comData = BindData;
        for (var ii of BindData) {
            thisTask.LabBind[ii] = disResource;
        }
        thisTask.Data.raw1 = raw1str;
        thisTask.Data.raw2 = raw2str;
        return thisTask;
    }
    /* 外矿开采任务发布函数 */
    public_OutMine(sourceRoom, x, y, disRoom) {
        var pos = new RoomPosition(x, y, sourceRoom);
        if (!this.memory.StructureIdData.storageID)
            return null;
        if (!pos)
            return null;
        // 检查是否已经存在重复任务了
        for (var i of this.memory.Misson['Creep']) {
            if (i.name == '外矿开采' && i.Data.disRoom == disRoom)
                return null;
        }
        var thisTask = {
            name: '外矿开采',
            range: 'Creep',
            delayTick: 99999,
            level: 10,
            Data: {
                disRoom: disRoom,
                startpoint: zipPosition(pos)
            },
        };
        thisTask.CreepBind = { 'out-claim': { num: 0, bind: [] }, 'out-harvest': { num: 0, bind: [] }, 'out-car': { num: 0, bind: [] }, 'out-defend': { num: 0, bind: [] } };
        return thisTask;
    }
    /* power采集任务发布函数 */
    public_PowerHarvest(disRoom, x, y, num) {
        var thisTask = {
            name: 'power采集',
            range: 'Creep',
            delayTick: 5000,
            level: 10,
            Data: {
                room: disRoom,
                x: x,
                y: y,
                state: 1,
                num: num,
                Cnum: Math.ceil(num / 1600)
            },
            maxTime: 2,
        };
        thisTask.CreepBind = { 'power-attack': { num: 1, bind: [] }, 'power-heal': { num: 1, bind: [] }, 'power-carry': { num: 0, bind: [] } };
        return thisTask;
    }
    /* deposit采集任务发布函数 */
    public_DepositHarvest(disRoom, x, y, rType) {
        var thisTask = {
            name: 'deposit采集',
            range: 'Creep',
            delayTick: 2000,
            level: 10,
            Data: {
                room: disRoom,
                x: x,
                y: y,
                state: 1,
                rType: rType
            },
        };
        thisTask.CreepBind = { 'deposit': { num: 1, bind: [] } };
        var MissonNum = this.MissionNum('Creep', 'deposit采集');
        if (MissonNum > 2)
            return null;
        thisTask.maxTime = MissonNum;
        return thisTask;
    }
    /* 红球防御任务发布函数 */
    public_red_defend(num) {
        var thisTask = {
            name: '红球防御',
            range: 'Creep',
            delayTick: 99999,
            level: 10,
            Data: {},
        };
        var comList = ['XZHO2', 'XUH2O'];
        thisTask.CreepBind = {};
        thisTask.CreepBind['defend-attack'] = { num: 1, bind: [] };
        var labData = this.Bind_Lab(comList);
        if (labData === null)
            return null;
        thisTask.LabBind = labData;
        return thisTask;
    }
    /* 蓝球防御任务发布函数 */
    public_blue_defend(num) {
        var thisTask = {
            name: '蓝球防御',
            range: 'Creep',
            delayTick: 99999,
            level: 10,
            Data: {}
        };
        var comList = ['XZHO2', 'XKHO2'];
        thisTask.CreepBind = {};
        thisTask.CreepBind['defend-range'] = { num: num, bind: [] };
        var labData = this.Bind_Lab(comList);
        if (labData === null)
            return null;
        thisTask.LabBind = labData;
        return thisTask;
    }
    /* 双人小队防御任务发布函数 */
    public_double_defend(num) {
        var thisTask = {
            name: '双人防御',
            range: 'Creep',
            delayTick: 99999,
            level: 10,
            Data: {}
        };
        var comList = ['XZHO2', 'XLHO2', 'XUH2O', 'XGHO2'];
        thisTask.CreepBind = {};
        thisTask.CreepBind['defend-douAttack'] = { num: num, bind: [] };
        thisTask.CreepBind['defend-douHeal'] = { num: num, bind: [] };
        var labData = this.Bind_Lab(comList);
        if (labData === null)
            return null;
        thisTask.LabBind = labData;
        return thisTask;
    }
    /* 四人小队任务发布函数 */
    public_squad(disRoom, shard, interval, RNum, ANum, DNum, HNum, AIONum, flag) {
        var thisTask = {
            name: '四人小队',
            range: 'Creep',
            delayTick: 40000,
            level: 10,
            Data: {
                disRoom: disRoom,
                shard: shard,
                flag: flag
            },
            CreepBind: {},
            maxTime: 3,
            reserve: true
        };
        if (RNum + ANum + DNum + HNum + AIONum != 4)
            return null; // 防止数量不对
        if (HNum != 2 && AIONum != 4)
            return null; // 防止搭配不均
        let creepData = {
            'x-range': { num: RNum, bd: ['XZHO2', 'XLHO2', 'XKHO2', 'XGHO2'] },
            'x-heal': { num: HNum, bd: ['XZHO2', 'XLHO2', 'XKHO2', 'XGHO2'] },
            'x-aio': { num: AIONum, bd: ['XZHO2', 'XLHO2', 'XKHO2', 'XGHO2'] },
            'x-attack': { num: ANum, bd: ['XZHO2', 'XUH2O', 'XGHO2'] },
            'x-dismantle': { num: DNum, bd: ['XZHO2', 'XZH2O', 'XGHO2'] },
        };
        let tbd = [];
        for (var i in creepData) {
            if (creepData[i].num > 0) {
                thisTask.CreepBind[i] = { num: creepData[i].num, bind: [], interval: interval };
                for (var j of creepData[i].bd) {
                    if (!isInArray(tbd, j))
                        tbd.push(j);
                }
            }
        }
        var labData = this.Bind_Lab(tbd);
        if (labData === null)
            return null;
        thisTask.LabBind = labData;
        return thisTask;
    }
}

/* 房间原型拓展   --任务  --基本功能 */
class RoomMissonBehaviourExtension extends Room {
    // 搬运基本任务
    Task_Carry(misson) {
        /* 搬运任务需求 sourcePosX,Y sourceRoom targetPosX,Y targetRoom num  rType  */
        // 没有任务数据 或者数据不全就取消任务
        if (!misson.Data)
            this.DeleteMission(misson.id);
        if (!misson.CreepBind)
            this.DeleteMission(misson.id);
    }
    // 建造任务
    Constru_Build() {
        if (Game.time % 51)
            return;
        if (this.controller.level < 5)
            return;
        var myConstrusion = new RoomPosition(Memory.RoomControlData[this.name].center[0], Memory.RoomControlData[this.name].center[1], this.name).findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if (myConstrusion) {
            /* 添加一个进孵化队列 */
            this.NumSpawn('build', 1);
        }
        else {
            delete this.memory.SpawnConfig['build'];
        }
    }
    // 资源link资源转移至centerlink中
    Task_CenterLink() {
        if ((global.Gtime[this.name] - Game.time) % 13)
            return;
        if (!this.memory.StructureIdData.source_links)
            this.memory.StructureIdData.source_links = [];
        if (!this.memory.StructureIdData.center_link || this.memory.StructureIdData.source_links.length <= 0)
            return;
        let center_link = Game.getObjectById(this.memory.StructureIdData.center_link);
        if (!center_link) {
            delete this.memory.StructureIdData.center_link;
            return;
        }
        else {
            if (center_link.store.getUsedCapacity('energy') > 750)
                return;
        }
        for (let id of this.memory.StructureIdData.source_links) {
            let source_link = Game.getObjectById(id);
            if (!source_link) {
                let index = this.memory.StructureIdData.source_links.indexOf(id);
                this.memory.StructureIdData.source_links.splice(index, 1);
                return;
            }
            if (source_link.store.getUsedCapacity('energy') >= 600 && this.Check_Link(source_link.pos, center_link.pos)) {
                var thisTask = this.Public_link([source_link.id], center_link.id, 10);
                this.AddMission(thisTask);
                return;
            }
        }
    }
    // 消费link请求资源 例如升级Link
    Task_ComsumeLink() {
        if ((global.Gtime[this.name] - Game.time) % 7)
            return;
        if (!this.memory.StructureIdData.center_link)
            return;
        let center_link = Game.getObjectById(this.memory.StructureIdData.center_link);
        if (!center_link) {
            delete this.memory.StructureIdData.center_link;
            return;
        }
        if (this.memory.StructureIdData.upgrade_link) {
            let upgrade_link = Game.getObjectById(this.memory.StructureIdData.upgrade_link);
            if (!upgrade_link) {
                delete this.memory.StructureIdData.upgrade_link;
                return;
            }
            if (upgrade_link.store.getUsedCapacity('energy') < 400) {
                var thisTask = this.Public_link([center_link.id], upgrade_link.id, 25);
                this.AddMission(thisTask);
                return;
            }
            if (this.memory.StructureIdData.comsume_link.length > 0) {
                for (var i of this.memory.StructureIdData.comsume_link) {
                    let l = Game.getObjectById(i);
                    if (!l) {
                        let index = this.memory.StructureIdData.comsume_link.indexOf(i);
                        this.memory.StructureIdData.comsume_link.splice(index, 1);
                        return;
                    }
                    if (l.store.getUsedCapacity('energy') < 500) {
                        var thisTask = this.Public_link([center_link.id], l.id, 35);
                        this.AddMission(thisTask);
                        return;
                    }
                }
            }
        }
    }
    // lab合成任务 （底层）
    Task_Compound(misson) {
        if (Game.time % 5)
            return;
        if (!this.memory.StructureIdData.labInspect || Object.keys(this.memory.StructureIdData.labInspect).length < 3)
            return;
        let storage_ = global.Stru[this.name]['storage'];
        let terminal_ = global.Stru[this.name]['terminal'];
        if (misson.Data.num <= 0 || !storage_ || !terminal_) {
            this.DeleteMission(misson.id);
            return;
        }
        let raw1 = Game.getObjectById(this.memory.StructureIdData.labInspect.raw1);
        let raw2 = Game.getObjectById(this.memory.StructureIdData.labInspect.raw2);
        let re = false;
        for (let i of misson.Data.comData) {
            var thisLab = Game.getObjectById(i);
            if (!thisLab)
                continue;
            if (thisLab.cooldown)
                continue;
            let comNum = 5;
            if (thisLab.effects && thisLab.effects.length > 0) {
                for (var effect_ of thisLab.effects) {
                    if (effect_.effect == PWR_OPERATE_LAB) {
                        var level = effect_.level;
                        comNum += level * 2;
                    }
                }
            }
            if (thisLab.runReaction(raw1, raw2) == OK) {
                misson.Data.num -= comNum;
            }
            if (thisLab.mineralType && thisLab.store.getUsedCapacity(thisLab.mineralType) >= 2500 && this.RoleMissionNum('transport', '物流运输') < 2 && this.Check_Carry('transport', thisLab.pos, storage_.pos, thisLab.mineralType)) {
                /* 资源快满了就要搬运 */
                re = true;
                var thisTask = this.Public_Carry({ 'transport': { num: 1, bind: [] } }, 30, this.name, thisLab.pos.x, thisLab.pos.y, this.name, storage_.pos.x, storage_.pos.y, thisLab.mineralType, thisLab.store.getUsedCapacity(thisLab.mineralType));
                this.AddMission(thisTask);
                continue;
            }
        }
        if (re)
            return;
        /* 源lab缺资源就运 */
        if (storage_.store.getUsedCapacity(misson.Data.raw1) > 0)
            if (raw1.store.getUsedCapacity(misson.Data.raw1) < 500 && this.RoleMissionNum('transport', '物流运输') < 2 && this.Check_Carry('transport', storage_.pos, raw1.pos, misson.Data.raw1)) {
                var thisTask = this.Public_Carry({ 'transport': { num: 1, bind: [] } }, 30, this.name, storage_.pos.x, storage_.pos.y, this.name, raw1.pos.x, raw1.pos.y, misson.Data.raw1, storage_.store.getUsedCapacity(misson.Data.raw1) >= 1000 ? 1000 : storage_.store.getUsedCapacity(misson.Data.raw1));
                this.AddMission(thisTask);
            }
        if (storage_.store.getUsedCapacity(misson.Data.raw2) > 0)
            if (raw2.store.getUsedCapacity(misson.Data.raw2) < 500 && this.RoleMissionNum('transport', '物流运输') < 2 && this.Check_Carry('transport', storage_.pos, raw2.pos, misson.Data.raw2)) {
                var thisTask = this.Public_Carry({ 'transport': { num: 1, bind: [] } }, 30, this.name, storage_.pos.x, storage_.pos.y, this.name, raw2.pos.x, raw2.pos.y, misson.Data.raw2, storage_.store.getUsedCapacity(misson.Data.raw2) >= 1000 ? 1000 : storage_.store.getUsedCapacity(misson.Data.raw2));
                this.AddMission(thisTask);
            }
        /* 资源调度 */
        var needResource = [misson.Data.raw1, misson.Data.raw2];
        if (this.MissionNum('Structure', '资源购买') > 0)
            return; // 存在资源购买任务的情况下，不执行资源调度
        if (DispatchNum(this.name) >= 2)
            return; // 资源调度数量过多则不执行资源调度
        for (var resource_ of needResource) {
            // 原矿 资源调用
            if (storage_.store.getUsedCapacity(resource_) + terminal_.store.getUsedCapacity(resource_) < 10000 && isInArray(['H', 'O', 'K', 'L', 'X', 'U', 'Z'], resource_)) {
                if (checkDispatch(this.name, resource_))
                    continue; // 已经存在调用信息的情况
                if (checkSend(this.name, resource_))
                    continue; // 已经存在其它房间的传送信息的情况
                console.log(Colorful$1(`[资源调度] 房间${this.name}没有足够的资源[${resource_}],将执行资源调度!`, 'yellow'));
                let dispatchTask = {
                    sourceRoom: this.name,
                    rType: resource_,
                    num: 10000,
                    delayTick: 200,
                    conditionTick: 35,
                    buy: true,
                    mtype: 'deal'
                };
                Memory.ResourceDispatchData.push(dispatchTask);
                return;
            }
            // 其他中间物 资源调用
            else if (storage_.store.getUsedCapacity(resource_) + terminal_.store.getUsedCapacity(resource_) < 500 && !isInArray(['H', 'O', 'K', 'L', 'X', 'U', 'Z'], resource_)) {
                if (checkDispatch(this.name, resource_))
                    continue; // 已经存在调用信息的情况
                if (checkSend(this.name, resource_))
                    continue; // 已经存在其它房间的传送信息的情况
                console.log(Colorful$1(`[资源调度] 房间${this.name}没有足够的资源[${resource_}],将执行资源调度!`, 'yellow'));
                let dispatchTask = {
                    sourceRoom: this.name,
                    rType: resource_,
                    num: 1000,
                    delayTick: 100,
                    conditionTick: 25,
                    buy: true,
                    mtype: 'deal'
                };
                Memory.ResourceDispatchData.push(dispatchTask);
                return;
            }
        }
    }
    // 合成规划     (中层)    目标化合物 --> 安排一系列合成
    Task_CompoundDispatch() {
        if ((Game.time - global.Gtime[this.name]) % 50)
            return;
        if (this.memory.switch.AutoDefend)
            return;
        if (this.RoleMissionNum('transport', '物流运输') > 0)
            return;
        if (Object.keys(this.memory.ComDispatchData).length <= 0)
            return; //  没有合成规划情况
        if (this.MissionNum('Room', '资源合成') > 0)
            return; // 有合成任务情况
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_)
            return;
        var terminal_ = global.Stru[this.name]['terminal'];
        if (!terminal_)
            return;
        /* 没有房间合成实验室数据，不进行合成 */
        if (!this.memory.StructureIdData.labInspect.raw1) {
            console.log(`房间${this.name}不存在合成实验室数据！`);
            return;
        }
        /* 查看合成实验室的被占用状态 */
        if (this.memory.RoomLabBind[this.memory.StructureIdData.labInspect.raw1] || this.memory.RoomLabBind[this.memory.StructureIdData.labInspect.raw2]) {
            console.log(`房间${this.name}的源lab被占用!`);
            return;
        }
        var comLabs = [];
        for (var otLab of this.memory.StructureIdData.labInspect.com) {
            if (!this.memory.RoomLabBind[otLab])
                comLabs.push(otLab);
        }
        if (comLabs.length <= 0) {
            console.log(`房间${this.name}的合成lab全被占用!`);
            return;
        }
        /* 确认所有目标lab里都没有其他资源 */
        for (var i of this.memory.StructureIdData.labs) {
            var thisLab = Game.getObjectById(i);
            if (!thisLab)
                continue;
            if (thisLab.mineralType && !this.memory.RoomLabBind[i])
                return;
        }
        /**
         * 正式开始合成规划
         *  */
        var data = this.memory.ComDispatchData;
        LoopA: for (var disType in data) {
            let storeNum = storage_.store.getUsedCapacity(disType);
            let dispatchNum = this.memory.ComDispatchData[disType].dispatch_num;
            // 不是最终目标资源的情况下
            if (Object.keys(data)[Object.keys(data).length - 1] != disType)
                if (storeNum < dispatchNum) {
                    let diff = dispatchNum - storeNum;
                    /* 先判定一下是否已经覆盖，如果已经覆盖就不合成 例如：ZK 和 G的关系，只要G数量满足了就不考虑 */
                    var mapResource = resourceMap(disType, Object.keys(data)[Object.keys(data).length - 1]);
                    if (mapResource.length > 0) {
                        for (var mR of mapResource) {
                            if (storage_.store.getUsedCapacity(mR) >= data[disType].dispatch_num)
                                continue LoopA;
                        }
                    }
                    // 下达合成命令
                    var thisTask = this.public_Compound(diff, disType, comLabs);
                    if (this.AddMission(thisTask)) {
                        data[disType].ok = true;
                    }
                    return;
                }
            // 是最终目标资源的情况下
            if (Object.keys(data)[Object.keys(data).length - 1] == disType) {
                // 下达合成命令
                var thisTask = this.public_Compound(data[disType].dispatch_num, disType, comLabs);
                if (this.AddMission(thisTask))
                    this.memory.ComDispatchData = {};
                return;
            }
        }
    }
    /* 烧Power发布函数任务 */
    Task_montitorPower() {
        if (Game.time % 7)
            return;
        if (this.controller.level < 8)
            return;
        if (!this.memory.switch.StopPower)
            return;
        // 有任务了就不发布烧帕瓦的任务
        if (this.MissionNum('Room', 'power升级') > 0)
            return;
        let storage_ = global.Stru[this.name]['storage'];
        //  powerspawn_ = global.Stru[this.name]['powerspawn'] as StructurePowerSpawn
        if (!storage_)
            return;
        // SavePower 是节省能量的一种"熔断"机制 防止烧power致死
        if (storage_.store.getUsedCapacity('energy') > this.memory.switch.SavePower ? 250000 : storage_.store.getUsedCapacity('power') > 100) {
            /* 发布烧power任务 */
            var thisTask = {
                name: 'power升级',
                delayTick: 200,
                range: 'Room',
                state: 1
            };
            this.AddMission(thisTask);
        }
    }
    /* 烧Power执行函数 */
    Task_ProcessPower(misson) {
        let storage_ = global.Stru[this.name]['storage'];
        let powerspawn_ = global.Stru[this.name]['powerspawn'];
        let terminal_ = global.Stru[this.name]['terminal'];
        if (!storage_ || !powerspawn_ || !terminal_)
            return;
        if (misson.state == 1) {
            if (this.RoleMissionNum('manage', '物流运输') > 0)
                return;
            if (powerspawn_.store.getFreeCapacity('energy') > 0) {
                var carryTask = this.Public_Carry({ 'manage': { num: 1, bind: [] } }, 10, this.name, storage_.pos.x, storage_.pos.y, this.name, powerspawn_.pos.x, powerspawn_.pos.y, 'energy', powerspawn_.store.getFreeCapacity('energy'));
                this.AddMission(carryTask);
                return;
            }
            if (powerspawn_.store.getFreeCapacity('power') > 0) {
                var carryTask = this.Public_Carry({ 'manage': { num: 1, bind: [] } }, 10, this.name, storage_.pos.x, storage_.pos.y, this.name, powerspawn_.pos.x, powerspawn_.pos.y, 'power', powerspawn_.store.getFreeCapacity('power'));
                this.AddMission(carryTask);
                return;
            }
            misson.state = 2;
        }
        else if (misson.state == 2) {
            powerspawn_.processPower();
            if (powerspawn_.store.getUsedCapacity('energy') == 0 || powerspawn_.store.getUsedCapacity('power') == 0)
                this.DeleteMission(misson.id);
        }
    }
}

/* 房间原型拓展   --任务  --运输工任务 */
class RoomMissonTransportExtension extends Room {
    // 虫卵填充任务
    Spawn_Feed() {
        /* 每11 tick 观察一次 */
        if (Game.time % 10)
            return;
        if (!this.memory.StructureIdData.storageID)
            return;
        if (this.RoleMissionNum('transport', '虫卵填充') < 1) {
            let thisPos = new RoomPosition(Memory.RoomControlData[this.name].center[0], Memory.RoomControlData[this.name].center[1], this.name);
            let emptyExtensions = thisPos.findClosestByPath(FIND_MY_STRUCTURES, { filter: (structure) => {
                    return (structure.structureType == 'spawn' || structure.structureType == 'extension') && structure.store.getFreeCapacity('energy') > 0;
                } });
            if (emptyExtensions) {
                /* 满足条件则触发虫卵填充任务 */
                var thisMisson = {
                    name: "虫卵填充",
                    range: "Creep",
                    delayTick: 50,
                    cooldownTick: 4,
                    CreepBind: { 'transport': { num: 2, bind: [] } },
                    Data: {}
                };
                this.AddMission(thisMisson);
            }
        }
    }
    // 防御塔填充任务
    Tower_Feed() {
        if (Game.shard.name == 'shard3') {
            if (Game.time % 15)
                return;
        }
        else {
            if (Game.time % 5)
                return;
        }
        if (!this.memory.StructureIdData.storageID)
            return;
        for (let id of this.memory.StructureIdData.AtowerID) {
            let tower = Game.getObjectById(id);
            if (!tower) {
                let index = this.memory.StructureIdData.AtowerID.indexOf(id);
                this.memory.StructureIdData.AtowerID.splice(index, 1);
            }
            if (tower.store.getUsedCapacity('energy') < 500) {
                /* 下达搬运任务搬运 */
                let storage_ = Game.getObjectById(this.memory.StructureIdData.storageID);
                if (!storage_)
                    return;
                if (this.RoleMissionNum('transport', '物流运输') > 3 || !this.Check_Carry('transport', storage_.pos, tower.pos, 'energy'))
                    continue;
                if (storage_.store.getUsedCapacity('energy') < 1000)
                    return;
                let thisTask = this.Public_Carry({ 'transport': { num: 2, bind: [] } }, 35, this.name, storage_.pos.x, storage_.pos.y, this.name, tower.pos.x, tower.pos.y, 'energy', 1000 - tower.store.getUsedCapacity('energy'));
                this.AddMission(thisTask);
                return;
            }
        }
    }
    // 实验室能量填充任务 [包含多余物回收]
    Lab_Feed() {
        if ((global.Gtime[this.name] - Game.time) % 13)
            return;
        if (!this.memory.StructureIdData.storageID)
            return;
        if (!this.memory.StructureIdData.labs || this.memory.StructureIdData.labs.length <= 0)
            return;
        let missionNum = this.RoleMissionNum('transport', '物流运输');
        if (missionNum > 3) {
            console.log("任务数量过多!为", missionNum);
            return;
        }
        for (var id of this.memory.StructureIdData.labs) {
            var thisLab = Game.getObjectById(id);
            if (!thisLab) {
                var index = this.memory.StructureIdData.labs.indexOf(id);
                this.memory.StructureIdData.labs.splice(index, 1);
                continue;
            }
            if (thisLab.store.getUsedCapacity('energy') <= 800) {
                /* 下布搬运命令 */
                var storage_ = Game.getObjectById(this.memory.StructureIdData.storageID);
                if (!storage_)
                    return;
                if (storage_.store.getUsedCapacity('energy') < 2000 || !this.Check_Carry('transport', storage_.pos, thisLab.pos, 'energy')) {
                    continue;
                }
                var thisTask = this.Public_Carry({ 'transport': { num: 1, bind: [] } }, 25, this.name, storage_.pos.x, storage_.pos.y, this.name, thisLab.pos.x, thisLab.pos.y, 'energy', 2000 - thisLab.store.getUsedCapacity('energy'));
                this.AddMission(thisTask);
                return;
            }
            /* 如果该实验室不在绑定状态却有多余资源 */
            if (!this.memory.RoomLabBind[id] && thisLab.mineralType) {
                var storage_ = Game.getObjectById(this.memory.StructureIdData.storageID);
                if (!storage_)
                    return;
                var thisTask = this.Public_Carry({ 'transport': { num: 1, bind: [] } }, 25, this.name, thisLab.pos.x, thisLab.pos.y, this.name, storage_.pos.x, storage_.pos.y, thisLab.mineralType, thisLab.store.getUsedCapacity(thisLab.mineralType));
                this.AddMission(thisTask);
                return;
            }
        }
    }
    // 核弹填充任务
    Nuker_Feed() {
        if (Game.time % 103)
            return;
        if (!this.memory.StructureIdData.NukerID || !this.memory.StructureIdData.storageID)
            return;
        if (this.RoleMissionNum('transport', '物流运输') >= 1)
            return;
        var nuker = Game.getObjectById(this.memory.StructureIdData.NukerID);
        var storage_ = Game.getObjectById(this.memory.StructureIdData.storageID);
        if (!nuker) {
            delete this.memory.StructureIdData.NukerID;
            return;
        }
        if (!storage_) {
            delete this.memory.StructureIdData.storageID;
            return;
        }
        if (nuker.store.getUsedCapacity('G') < 5000 && storage_.store.getUsedCapacity('G') >= 5000) {
            var thisTask = this.Public_Carry({ 'transport': { num: 1, bind: [] } }, 40, this.name, storage_.pos.x, storage_.pos.y, this.name, nuker.pos.x, nuker.pos.y, 'G', 5000 - nuker.store.getUsedCapacity('G'));
            this.AddMission(thisTask);
            return;
        }
        if (nuker.store.getUsedCapacity('energy') < 300000 && storage_.store.getUsedCapacity('energy') > 130000) {
            var thisTask = this.Public_Carry({ 'transport': { num: 1, bind: [] } }, 40, this.name, storage_.pos.x, storage_.pos.y, this.name, nuker.pos.x, nuker.pos.y, 'energy', 300000 - nuker.store.getUsedCapacity('energy'));
            this.AddMission(thisTask);
            return;
        }
    }
}

/* 房间原型拓展   --行为  --维护任务 */
class RoomMissonVindicateExtension extends Room {
    Task_Repair(mission) {
        if (mission.LabBind) {
            if (!this.Check_Lab(mission, 'transport', 'complex'))
                return;
        }
        if (mission.Data.RepairType == 'global') ;
        else if (mission.Data.RepairType == 'special') ;
        else if (mission.Data.RepairType == 'nuker') ;
    }
    /* 急速冲级 */
    Task_Quick_upgrade(mission) {
        if (this.controller.level >= 8) {
            this.DeleteMission(mission.id);
            console.log(`房间${this.name}等级已到8级，删除任务!`);
            return;
        }
        if (!this.memory.StructureIdData.terminalID)
            return;
        /* 能量购买 */
        let terminal_ = Game.getObjectById(this.memory.StructureIdData.terminalID);
        if (!terminal_)
            return;
        if (!mission.Data.standed)
            mission.Data.standed = true;
        /* 如果terminal附近已经充满了爬虫，则standed为false */
        let creeps = terminal_.pos.findInRange(FIND_MY_CREEPS, 1);
        if (creeps.length >= 8)
            mission.Data.standed = false;
        else
            mission.Data.standed = true;
        if (!this.Check_Lab(mission, 'transport', 'complex'))
            return;
        if (Game.time % 40)
            return;
        if (terminal_.store.getUsedCapacity('energy') < 100000 && Game.market.credits >= 1000000) {
            let ave = avePrice('energy', 2);
            let highest = highestPrice('energy', 'buy', ave + 6);
            if (!haveOrder(this.name, 'energy', 'buy', highest, -0.2)) {
                let result = Game.market.createOrder({
                    type: ORDER_BUY,
                    resourceType: 'energy',
                    price: highest + 0.1,
                    totalAmount: 100000,
                    roomName: this.name
                });
                if (result != OK) {
                    console.log("创建能量订单出错,房间", this.name);
                }
                console.log(Colorful$1(`[急速冲级]房间${this.name}创建energy订单,价格:${highest + 0.01};数量:100000`, 'green', true));
            }
        }
    }
    /* 紧急援建 */
    Task_HelpBuild(mission) {
        if ((Game.time - global.Gtime[this.name]) % 9)
            return;
        if (mission.LabBind) {
            if (!this.Check_Lab(mission, 'transport', 'complex'))
                return; // 如果目标lab的t3少于 1000 发布搬运任务
        }
    }
    /* 紧急支援 */
    Task_HelpDefend(mission) {
        // if ((Game.time - global.Gtime[this.name]) % 9) return
        if (mission.LabBind) {
            if (!this.Check_Lab(mission, 'transport', 'complex'))
                return;
        }
    }
}

/* 房间原型拓展   --方法  --防御塔 */
class RoomFunctionTowerExtension extends Room {
    TowerWork() {
        if (this.memory.state == 'peace') {
            if (Game.flags[`${this.name}/repair`]) {
                var towers = this.find(FIND_MY_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == 'tower' && stru.id != this.memory.StructureIdData.NtowerID;
                    } });
                var ramparts = this.getListHitsleast(['rampart', 'constructedWall'], 3);
                for (var t of towers)
                    if (t.store.getUsedCapacity('energy') > 400)
                        t.repair(ramparts);
            }
            let Ntower = null;
            if (this.memory.StructureIdData.NtowerID) {
                Ntower = Game.getObjectById(this.memory.StructureIdData.NtowerID);
            }
            if (!Ntower) {
                delete this.memory.StructureIdData.NtowerID;
                return;
            }
            if ((Game.time - global.Gtime[this.name]) % 5 == 0) {
                /* 寻找路，修路 */
                var repairRoad = Ntower.pos.findClosestByRange(FIND_STRUCTURES, { filter: (stru) => {
                        return (stru.structureType == 'road' || stru.structureType == 'container') && stru.hits / stru.hitsMax < 0.8;
                    } });
                if (repairRoad)
                    Ntower.repair(repairRoad);
            }
        }
        else if (this.memory.state == 'war') {
            if (Game.flags[`${this.name}/stop`])
                return;
            if (this.memory.switch.AutoDefend) {
                return;
            }
            /* 没有主动防御下的防御塔逻辑 */
            let enemys = this.find(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                    return !isInArray(Memory.whitesheet, creep.owner.username);
                } });
            if (!this.memory.StructureIdData.AtowerID)
                this.memory.StructureIdData.AtowerID = [];
            if (enemys.length <= 0)
                return;
            else if (enemys.length == 1) {
                for (let c of this.memory.StructureIdData.AtowerID) {
                    let thisTower = Game.getObjectById(c);
                    if (!thisTower) {
                        let index = this.memory.StructureIdData.AtowerID.indexOf(c);
                        this.memory.StructureIdData.AtowerID.splice(index, 1);
                        continue;
                    }
                    thisTower.attack(enemys[0]);
                }
            }
            else if (enemys.length > 1) {
                for (let c of this.memory.StructureIdData.AtowerID) {
                    let thisTower = Game.getObjectById(c);
                    if (!thisTower) {
                        let index = this.memory.StructureIdData.AtowerID.indexOf(c);
                        this.memory.StructureIdData.AtowerID.splice(index, 1);
                        continue;
                    }
                    if (Game.time % 2)
                        thisTower.attack(enemys[0]);
                    else
                        thisTower.attack(enemys[1]);
                }
            }
        }
    }
}

/* 房间原型拓展   --任务  --常规战争 */
class NormalWarExtension extends Room {
    // 拆迁黄球
    Task_dismantle(mission) {
        if ((Game.time - global.Gtime[this.name]) % 10)
            return;
        if (mission.Data.boost) {
            // 体型
            global.SpecialBodyData[this.name]['dismantle'] = GenerateAbility(40, 0, 10, 0, 0, 0, 0, 0);
            // boost lab填充检查
            if (!this.Check_Lab(mission, 'transport', 'complex'))
                return;
        }
        /* 数量投放 */
        if (mission.CreepBind['dismantle'].num == 0)
            mission.CreepBind['dismantle'].num = mission.Data.num;
    }
    // 一体机
    Task_aio(mission) {
        if (mission.Data.boost) {
            // 体型
            global.SpecialBodyData[this.name]['aio'] = GenerateAbility(0, 0, 10, 0, 6, 23, 0, 11);
            if ((Game.time - global.Gtime[this.name]) % 10)
                return;
            // boost lab填充检查
            if (!this.Check_Lab(mission, 'transport', 'complex'))
                return;
        }
        else {
            if ((Game.time - global.Gtime[this.name]) % 10)
                return;
        }
        if (mission.CreepBind['aio'].num == 0)
            mission.CreepBind['aio'].num = mission.Data.num;
    }
    // 四人小队
    Task_squad(mission) {
        if ((Game.time - global.Gtime[this.name]) % 7)
            return;
        if (!mission.Data.squadID) {
            if (!Memory.squadMemory)
                Memory.squadMemory = {};
            for (var i = 1; i < 100; i++) {
                if (!Memory.squadMemory[`${mission.Data.flag}${i}|${Game.shard.name}`]) {
                    mission.Data.squadID = `${mission.Data.flag}${i}|${Game.shard.name}`;
                    break;
                }
            }
        }
        else {
            if (Memory.squadMemory[mission.Data.squadID] && Object.keys(Memory.squadMemory[mission.Data.squadID].creepData).length >= 4) {
                delete mission.Data.squadID;
            }
        }
        if (!this.Check_Lab(mission, 'transport', 'complex'))
            return;
    }
}

/* 房间原型拓展   --任务  --中央运输工任务 */
class RoomMissonManageExtension extends Room {
    /* 链接送仓   即中央链接能量转移至仓库 */
    Task_Clink() {
        if ((Game.time - global.Gtime[this.name]) % 15)
            return;
        if (!this.memory.StructureIdData.center_link)
            return;
        var center_link = Game.getObjectById(this.memory.StructureIdData.center_link);
        if (!center_link) {
            delete this.memory.StructureIdData.center_link;
            return;
        }
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_) {
            return;
        }
        if (storage_.store.getFreeCapacity() <= 10000)
            return; // storage满了就不挂载任务了
        for (var i of this.memory.Misson['Structure']) {
            if (i.name == '链传送能' && isInArray(i.structure, this.memory.StructureIdData.center_link))
                return;
        }
        if (center_link.store.getUsedCapacity('energy') >= 400 && this.Check_Carry('manage', center_link.pos, storage_.pos, 'energy')) {
            var thisTask = this.Public_Carry({ 'manage': { num: 1, bind: [] } }, 20, this.name, center_link.pos.x, center_link.pos.y, this.name, storage_.pos.x, storage_.pos.y, 'energy');
            this.AddMission(thisTask);
        }
    }
}

/* 房间原型拓展   --行为  --防御任务 */
class RoomMissonDefendExtension extends Room {
    // 核弹防御
    Nuke_Defend() {
        if (this.memory.nukeData && this.memory.nukeData.damage && Object.keys(this.memory.nukeData.damage).length > 0)
            for (var i in this.memory.nukeData.damage) {
                var thisPos = unzipPosition(i);
                new RoomVisual(this.name).text(`${this.memory.nukeData.damage[i] / 1000000}M`, thisPos.x, thisPos.y, { color: this.memory.nukeData.damage[i] == 0 ? 'green' : 'red', font: 0.5 });
            }
        if (Game.time % 41)
            return;
        var nuke_ = this.find(FIND_NUKES);
        if (this.controller.level < 6)
            return;
        // var nuke_ = this.find(FIND_FLAGS,{filter:(flag_)=>{return flag_.color == COLOR_ORANGE}})
        if (!this.memory.nukeID)
            this.memory.nukeID = [];
        if (!this.memory.nukeData)
            this.memory.nukeData = { damage: {}, rampart: {} };
        if (nuke_.length > 0) {
            /* 发现核弹，激活核防御任务 */
            var data = this.memory.nukeData.damage;
            var rampart = this.memory.nukeData.rampart;
            for (var n of nuke_) {
                if (isInArray(this.memory.nukeID, n.id))
                    continue;
                var strPos = zipPosition(n.pos);
                if (n.pos.GetStructureList(['spawn', 'rampart', 'terminal', 'powerSpawn', 'factory', 'nuker', 'lab', 'tower', 'storage']).length > 0) {
                    if (!data[strPos])
                        data[strPos] = 10000000;
                    else
                        data[strPos] += 10000000;
                    if (!rampart[strPos]) {
                        var rampart_ = n.pos.GetStructure('rampart');
                        if (rampart_)
                            rampart[strPos] = rampart_.hits;
                        else
                            rampart[strPos] = 0;
                    }
                }
                for (var nX = n.pos.x - 2; nX < n.pos.x + 3; nX++)
                    LoopB: for (var nY = n.pos.y - 2; nY < n.pos.y + 3; nY++) {
                        var thisPos = new RoomPosition(nX, nY, this.name);
                        if (nX == n.pos.x && nY == n.pos.y)
                            continue LoopB;
                        if (thisPos.GetStructureList(['spawn', 'rampart', 'terminal', 'powerSpawn', 'factory', 'nuker', 'lab', 'tower']).length <= 0)
                            continue LoopB;
                        if (nX > 0 && nY > 0 && nX < 49 && nY < 49) {
                            var strThisPos = zipPosition(thisPos);
                            if (!data[strThisPos])
                                data[strThisPos] = 5000000;
                            else
                                data[strThisPos] += 5000000;
                            if (!rampart[strThisPos]) {
                                var rampart_ = n.pos.GetStructure('rampart');
                                if (rampart_)
                                    rampart[strThisPos] = rampart_.hits;
                                else
                                    rampart[strThisPos] = 0;
                            }
                        }
                    }
                this.memory.nukeID.push(n.id);
            }
            let allDamageNum = 0;
            for (var i in data) {
                /*  */
                var thisPos = unzipPosition(i);
                if (data[i] == 0) {
                    var rampart__ = thisPos.GetStructure('rampart');
                    if (rampart__) {
                        rampart[i] = rampart__.hits;
                    }
                }
                allDamageNum += data[i];
            }
            /* 计算总核弹需要维修的伤害确定 */
            var boostType = null;
            if (allDamageNum >= 50000000)
                boostType = 'XLH2O';
            var num = 1;
            if (allDamageNum >= 10000000 && allDamageNum < 20000000)
                num = 2;
            else if (allDamageNum >= 20000000 && allDamageNum < 40000000)
                num = 3;
            else if (allDamageNum >= 40000000)
                num = 3;
            var task;
            for (var t of this.memory.Misson['Creep']) {
                if (t.name == '墙体维护' && t.Data.RepairType == 'nuker')
                    task = t;
            }
            if (task) {
                task.Data.num = num;
                if (task.CreepBind['repair'].num != num)
                    task.CreepBind['repair'].num = num;
                if (task.Data.boostType == undefined && boostType == 'XLH2O') {
                    /* 删除现有任务，重新挂载有boost的任务 */
                    this.DeleteMission(task.id);
                }
            }
            /* 激活维修防核任务 */
            else {
                var thisTask = this.public_repair('nuker', num, boostType, false);
                if (thisTask && allDamageNum > 0)
                    this.AddMission(thisTask);
            }
            /* 去除废除的维护坐标 例如核弹已经砸过了，但是还没有修完 */
            if (Game.time % 9 == 0)
                LoopP: for (var po in this.memory.nukeData.damage) {
                    var thisPos = unzipPosition(po);
                    for (var nuk of nuke_) {
                        if (thisPos.inRangeTo(nuk, 2))
                            continue LoopP;
                    }
                    if (this.memory.nukeData.rampart[po])
                        delete this.memory.nukeData.rampart[po];
                    delete this.memory.nukeData.damage[po];
                }
        }
        else {
            for (var m of this.memory.Misson['Creep']) {
                if (m.name == '墙体维护' && m.Data.RepairType == 'nuker') {
                    this.DeleteMission(m.id);
                }
            }
            if (this.memory.nukeID.length > 0)
                this.memory.nukeID = [];
            this.memory.nukeData = { damage: {}, rampart: {} };
        }
    }
}

/* 房间原型拓展   --行为  --采矿任务 */
class RoomMissonMineExtension extends Room {
    /* 房间内矿资源采集发布任务 */
    Task_monitorMineral() {
        if ((Game.time - global.Gtime[this.name]) % 67)
            return;
        if (this.controller.level < 6)
            return;
        if (!this.memory.StructureIdData.mineralID)
            return;
        if (this.MissionNum('Creep', '原矿开采') > 0)
            return;
        var mineral = Game.getObjectById(this.memory.StructureIdData.mineralID);
        if (!mineral || mineral.ticksToRegeneration)
            return;
        if (!this.memory.mineralType)
            this.memory.mineralType = mineral.mineralType;
        if (this.controller.level >= 6 && !this.memory.StructureIdData.extractID) {
            /* 寻找矿物点 在其附近撒下建筑 */
            if (!mineral.pos.GetStructure('extractor') && mineral.pos.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0) {
                mineral.pos.createConstructionSite('extractor');
                return;
            }
            return;
        }
        /* 寻找mineralContainerID */
        var container_ = mineral.pos.findInRange(FIND_STRUCTURES, 1, { filter: (stru) => {
                return stru.structureType == 'container';
            } });
        var container_cons = mineral.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1, { filter: (stru) => {
                return stru.structureType == 'container';
            } });
        if (container_.length <= 0 && container_cons.length <= 0) {
            /* 建立container */
            var result = [];
            var terrain = new Room.Terrain(this.name);
            var xs = [mineral.pos.x - 1, mineral.pos.x, mineral.pos.x + 1];
            var ys = [mineral.pos.y - 1, mineral.pos.y, mineral.pos.y + 1];
            xs.forEach(x => ys.forEach(y => {
                if (terrain.get(x, y) != TERRAIN_MASK_WALL) {
                    result.push(new RoomPosition(x, y, this.name));
                }
            }));
            for (var p of result) {
                if (p.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0 && p.lookFor(LOOK_STRUCTURES).length <= 0) {
                    p.createConstructionSite('container');
                    return;
                }
            }
            return;
        }
        if (container_.length <= 0) {
            return;
        }
        /* 建筑都到位了，开始下任务 */
        var storage_ = Game.getObjectById(this.memory.StructureIdData.storageID);
        if (!storage_)
            return;
        /* 如果矿物饱和，挂任务卖原矿 */
        if (storage_.store.getUsedCapacity(this.memory.mineralType) > 200000) {
            if (!this.memory.market)
                this.memory.market = {};
            if (!this.memory.market['deal'])
                this.memory.market['deal'] = [];
            var bR = true;
            for (var od of this.memory.market['deal']) {
                if (od.rType == this.memory.mineralType)
                    bR = false;
            }
            if (bR) {
                /* 下达自动deal的任务 */
                this.memory.market['deal'].push({ rType: this.memory.mineralType, num: 30000 });
            }
        }
        /* 防止挖矿致死 */
        if (storage_.store.getFreeCapacity() > 200000 && storage_.store.getUsedCapacity(this.memory.mineralType) < 200000) {
            // 下达挖矿任务
            var thisTask = {
                name: '原矿开采',
                range: 'Creep',
                delayTick: 50000,
                level: 10,
                Data: {},
            };
            thisTask.CreepBind = { 'mineral': { num: 1, bind: [] } };
            this.AddMission(thisTask);
        }
    }
    /* 房间外矿处理任务 只适用于一般外矿 */
    Task_OutMine(misson) {
        if ((Game.time - global.Gtime[this.name]) % 13)
            return;
        if (!misson.Data.state)
            misson.Data.state = 1; // 默认状态1
        misson.CreepBind['out-claim'].num = 1;
        let disRoomName = misson.Data.disRoom;
        if (!Memory.outMineData[disRoomName])
            Memory.outMineData[disRoomName] = { road: [], startpoint: misson.Data.startpoint, minepoint: [], mineType: 'normal' };
        // 相关爬虫死亡后的数据擦除
        if (Memory.outMineData[disRoomName].minepoint && Memory.outMineData[disRoomName].minepoint.length > 0) {
            for (var obj of Memory.outMineData[disRoomName].minepoint) {
                if (obj.bind && obj.bind.harvest && !Game.creeps[obj.bind.harvest])
                    delete obj.bind.harvest;
                if (obj.bind && obj.bind.car && !Game.creeps[obj.bind.car])
                    delete obj.bind.car;
            }
        }
        if (misson.Data.state == 1) // 初始化状态
         {
            /* 状态1下仅仅获取外矿信息和派出claimer */
            if (Game.rooms[disRoomName]) {
                var sources = Game.rooms[disRoomName].find(FIND_SOURCES);
                if (sources.length <= 0) {
                    Game.notify(`房间${disRoomName}未发现能量点！删除外矿任务！`);
                    this.DeleteMission(misson.id);
                    return;
                }
                /* 说明有该房间的视野了 先查找矿点 */
                if (Memory.outMineData[disRoomName].minepoint.length < sources.length) {
                    LoopS: for (var s of sources) {
                        for (var m of Memory.outMineData[disRoomName].minepoint) {
                            if (m.pos == zipPosition(s.pos))
                                continue LoopS;
                        }
                        Memory.outMineData[disRoomName].minepoint.push({ pos: zipPosition(s.pos), bind: {} });
                    }
                    return;
                }
                /* 矿点信息更新完毕了 接下来更新路线信息 */
                if (!misson.Data.roadUpdated) {
                    var startpos = unzipPosition(Memory.outMineData[disRoomName].startpoint);
                    if (!startpos) {
                        console.log(`${startpos}不能解压成RoomPosition对象`);
                        return;
                    }
                    /* 每个矿点都要有一个路线信息 */
                    for (var s of sources) {
                        var results = startpos.FindPath(s.pos, 1);
                        LoopB: for (var p of results) {
                            if (p.isNearTo(s.pos))
                                continue;
                            if (isInArray([0, 49], p.x) || isInArray([0, 49], p.y))
                                continue LoopB;
                            /* 如果不再路径点缓存中，就push进路径列表中 */
                            if (!isInArray(Memory.outMineData[disRoomName].road, zipPosition(p))) {
                                Memory.outMineData[disRoomName].road.push(zipPosition(p));
                            }
                        }
                    }
                    misson.Data.roadUpdated = true;
                    return;
                }
                /* 先看路径点中是否有本房间的位置点，有的话就创建工地 */
                for (var mess of Memory.outMineData[disRoomName].road) {
                    if (unzipPosition(mess).roomName == this.name) {
                        unzipPosition(mess).createConstructionSite('road');
                        //var index = Memory.outMineData[disRoomName].road.indexOf(mess)
                        //Memory.outMineData[disRoomName].road.splice(index,1)
                    }
                }
                /* 路线信息更新完毕 接下来进入阶段2 */
                misson.Data.state = 2;
            }
        }
        else if (misson.Data.state == 2) // 采集状态 [正常状态]
         {
            misson.CreepBind['out-harvest'].num = Memory.outMineData[disRoomName].minepoint.length;
            misson.CreepBind['out-defend'].num = 0;
            if (Memory.outMineData[disRoomName].car) {
                misson.CreepBind['out-car'].num = Memory.outMineData[disRoomName].minepoint.length;
            }
            else
                misson.CreepBind['out-car'].num = 0;
        }
        else if (misson.Data.state == 3) // 防御状态
         {
            misson.CreepBind['out-harvest'].num = 0;
            misson.CreepBind['out-car'].num = 0;
            misson.CreepBind['out-defend'].num = 2;
            if (Game.rooms[misson.Data.disRoom]) {
                var enemys = Game.rooms[misson.Data.disRoom].find(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                        return !isInArray(Memory.whitesheet, creep.owner.username);
                    } });
                var InvaderCore = Game.rooms[misson.Data.disRoom].find(FIND_STRUCTURES, { filter: (stru) => {
                        return stru.structureType == STRUCTURE_INVADER_CORE;
                    } });
                if (enemys.length <= 0 && InvaderCore.length <= 0)
                    misson.Data.state = 2;
            }
        }
    }
    /* 过道采集监控发布任务 */
    Task_Cross(misson) {
        if (this.controller.level < 8 || !this.memory.StructureIdData.ObserverID)
            return;
        var observer_ = Game.getObjectById(this.memory.StructureIdData.ObserverID);
        if (!observer_) {
            delete this.memory.StructureIdData.ObserverID;
            return;
        }
        if (!misson.Data.relateRooms)
            misson.Data.relateRooms = [];
        if (misson.Data.relateRooms.length <= 0)
            return;
        if (!misson.Data.index)
            misson.Data.index = 0;
        if (!misson.Data.state)
            misson.Data.state = 1;
        if (misson.Data.index >= misson.Data.relateRooms.length)
            misson.Data.index = 0;
        if (misson.Data.state == 1) {
            /* 观察房间 */
            observer_.observeRoom(misson.Data.relateRooms[misson.Data.index]);
            // console.log(`observer正在观察房间${misson.Data.relateRooms[misson.Data.index]}`)
            /* 获取上个tick的房间名 */
            let beforRoom;
            if (misson.Data.relateRooms.length == 1)
                beforRoom = misson.Data.relateRooms[0];
            else if (misson.Data.relateRooms.length > 1) {
                if (misson.Data.index == 0)
                    beforRoom = misson.Data.relateRooms[misson.Data.relateRooms.length - 1];
                else
                    beforRoom = misson.Data.relateRooms[misson.Data.index - 1];
            }
            if (Game.rooms[beforRoom]) {
                /* 查找power和deposit */
                if (misson.Data.power) {
                    var powerbank = Game.rooms[beforRoom].find(FIND_STRUCTURES, { filter: (stru) => {
                            return stru.structureType == 'powerBank' && stru.ticksToDecay >= 3600 && stru.power > 3000;
                        } });
                    if (powerbank.length > 0) {
                        let BR = true;
                        for (var i of this.memory.Misson['Creep']) {
                            if (i.name == 'power采集' && i.Data.room == beforRoom && i.Data.x == powerbank[0].pos.x && i.Data.y == powerbank[0].pos.y) {
                                BR = false;
                            }
                        }
                        if (BR) {
                            /* 下达采集任务 */
                            var thisTask = this.public_PowerHarvest(beforRoom, powerbank[0].pos.x, powerbank[0].pos.y, powerbank[0].power);
                            if (thisTask != null) {
                                this.AddMission(thisTask);
                            }
                        }
                    }
                }
                if (misson.Data.deposit) {
                    var deposit = Game.rooms[beforRoom].find(FIND_DEPOSITS, { filter: (stru) => {
                            return stru.ticksToDecay >= 3800 && stru.lastCooldown < 150;
                        } });
                    if (deposit.length > 0) {
                        let BR = true;
                        for (var i of this.memory.Misson['Creep']) {
                            if (i.name == 'deposit采集' && i.Data.room == beforRoom && i.Data.x == deposit[0].pos.x && i.Data.y == deposit[0].pos.y) {
                                BR = false;
                            }
                        }
                        if (BR) {
                            /* 下达采集任务 */
                            var thisTask = this.public_DepositHarvest(beforRoom, deposit[0].pos.x, deposit[0].pos.y, deposit[0].depositType);
                            if (thisTask != null) {
                                this.AddMission(thisTask);
                            }
                        }
                    }
                }
            }
            misson.Data.index++;
            if (Game.rooms[beforRoom] && misson.Data.index == 1) {
                // console.log(Colorful("进入休息模式",'blue'))
                misson.Data.time = Game.time;
                misson.Data.state = 2;
            }
        }
        else if (misson.Data.state == 2) {
            if (Game.time - misson.Data.time != 0 && (Game.time - misson.Data.time) % 60 == 0) {
                misson.Data.state = 1;
                // console.log(Colorful("进入观察模式",'blue'))
            }
        }
    }
    /* Power采集 */
    Task_PowerHarvest(misson) {
        if (this.controller.level < 8)
            return;
        if (!misson.Data.state)
            misson.Data.state = 1;
        if (misson.Data.state == 1) {
            misson.CreepBind['power-carry'].num = 0;
        }
        else if (misson.Data.state == 2) {
            if (!misson.Data.down)
                misson.Data.down = false;
            if (!misson.Data.down) {
                misson.CreepBind['power-carry'].num = Math.ceil(misson.Data.num / 1600);
                misson.Data.down = true;
            }
            misson.CreepBind['power-attack'].num = 0;
            misson.CreepBind['power-heal'].num = 0;
            if (misson.CreepBind['power-carry'].num == misson.CreepBind['power-carry'].bind.length && misson.CreepBind['power-carry'].num != 0) {
                misson.CreepBind['power-carry'].num = 0;
            }
            if (misson.CreepBind['power-attack'].bind.length <= 0 && misson.CreepBind['power-heal'].bind.length <= 0 && misson.CreepBind['power-carry'].bind.length <= 0) {
                this.DeleteMission(misson.id);
            }
        }
    }
}

/* 房间原型拓展   --任务  --防御战争 */
class DefendWarExtension extends Room {
    /* 主动防御任务发布 */
    Task_Auto_Defend() {
        if (Game.time % 5)
            return;
        if (this.controller.level < 6)
            return;
        if (!this.memory.state)
            return;
        if (this.memory.state != 'war') {
            this.memory.switch.AutoDefend = false;
            this.memory.enemy = {};
            return;
        }
        /* 激活主动防御 */
        var enemys = this.find(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                return !isInArray(Memory.whitesheet, creep.owner.username) && (creep.owner.username != 'Invader') && deserveDefend(creep);
            } });
        if (enemys.length <= 0)
            return;
        /* 如果有合成任务，删除合成任务 */
        let compoundTask = this.MissionName('Room', '资源合成');
        if (compoundTask) {
            this.DeleteMission(compoundTask.id);
            return;
        }
        if (!this.memory.switch.AutoDefend) {
            this.memory.switch.AutoDefend = true; // 表示房间存在主动防御任务
            /* 寻找攻击方 */
            let users = [];
            for (let c of enemys)
                if (!isInArray(users, c.owner.username))
                    users.push(c.owner.username);
            let str = '';
            for (let s of users)
                str += ` ${s}`;
            Game.notify(`房间${this.name}激活主动防御! 目前检测到的攻击方为:${str},爬虫数为:${enemys.length},我们将抗战到底!`);
            console.log(`房间${this.name}激活主动防御! 目前检测到的攻击方为:${str},爬虫数为:${enemys.length},我们将抗战到底!`);
        }
        /* 分析敌对爬虫的数量,应用不同的主防任务应对 */
        let defend_plan = {};
        if (enemys.length == 1) // 1
         {
            defend_plan = { 'attack': 1 };
        }
        else if (enemys.length == 2) // 2
         {
            defend_plan = { 'attack': 1, 'range': 1 };
        }
        else if (enemys.length > 2 && enemys.length < 5) // 3-4
         {
            defend_plan = { 'attack': 1, 'double': 1, 'range': 0 };
        }
        else if (enemys.length >= 5 && enemys.length < 8) // 5-7
         {
            defend_plan = { 'attack': 1, 'double': 1, 'range': 1 };
        }
        else if (enemys.length >= 8) // >8     一般这种情况下各个类型的防御任务爬虫的数量都要调高
         {
            defend_plan = { 'attack': 2, 'double': 2 };
        }
        for (var plan in defend_plan) {
            if (plan == 'attack') {
                let num = this.MissionNum('Creep', '红球防御');
                if (num <= 0) {
                    let thisTask = this.public_red_defend(defend_plan[plan]);
                    if (thisTask) {
                        this.AddMission(thisTask);
                        console.log(`房间${this.name}红球防御任务激活!`);
                    }
                }
                else {
                    /* 已经存在的话查看数量是否正确 */
                    let task = this.MissionName('Creep', '红球防御');
                    if (task) {
                        task.CreepBind['defend-attack'].num = defend_plan[plan];
                        // console.log(Colorful(`房间${this.name}红球防御任务数量调整为${defend_plan[plan]}!`,'red'))
                    }
                }
            }
            else if (plan == 'range') {
                let num = this.MissionNum('Creep', '蓝球防御');
                if (num <= 0) {
                    let thisTask = this.public_blue_defend(defend_plan[plan]);
                    if (thisTask) {
                        this.AddMission(thisTask);
                        console.log(`房间${this.name}蓝球防御任务激活!`);
                    }
                }
                else {
                    /* 已经存在的话查看数量是否正确 */
                    let task = this.MissionName('Creep', '蓝球防御');
                    if (task) {
                        task.CreepBind['defend-range'].num = defend_plan[plan];
                        // console.log(Colorful(`房间${this.name}蓝球防御任务数量调整为${defend_plan[plan]}!`,'blue'))
                    }
                }
            }
            else if (plan == 'double') {
                let num = this.MissionNum('Creep', '双人防御');
                if (num <= 0) {
                    let thisTask = this.public_double_defend(defend_plan[plan]);
                    if (thisTask) {
                        this.AddMission(thisTask);
                        console.log(`房间${this.name}双人防御任务激活!`);
                    }
                }
                else {
                    /* 已经存在的话查看数量是否正确 */
                    let task = this.MissionName('Creep', '双人防御');
                    if (task) {
                        task.CreepBind['defend-douAttack'].num = defend_plan[plan];
                        task.CreepBind['defend-douHeal'].num = defend_plan[plan];
                        // console.log(Colorful(`房间${this.name}双人防御任务数量调整为${defend_plan[plan]}!`,'green'))
                    }
                }
            }
        }
        /* 主动防御分配系统更新 删除过期敌对爬虫数据 */
        for (let myCreepName in this.memory.enemy) {
            if (!Game.creeps[myCreepName])
                delete this.memory.enemy[myCreepName];
            else {
                /* 查找项目里的爬虫是否已经死亡 */
                for (let enemyID of this.memory.enemy[myCreepName]) {
                    if (!Game.getObjectById(enemyID)) {
                        let index = this.memory.enemy[myCreepName].indexOf(enemyID);
                        this.memory.enemy[myCreepName].splice(index, 1);
                    }
                }
            }
        }
    }
    /* 红球防御 */
    Task_Red_Defend(mission) {
        if ((Game.time - global.Gtime[this.name]) % 10)
            return;
        if (!this.Check_Lab(mission, 'transport', 'complex'))
            return;
        if ((Game.time - global.Gtime[this.name]) % 20)
            return;
        var enemys = this.find(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                return !isInArray(Memory.whitesheet, creep.owner.username) && (creep.owner.username != 'Invader' && deserveDefend(creep));
            } });
        if (enemys.length <= 0) {
            this.DeleteMission(mission.id);
        }
    }
    /* 蓝球防御 */
    Task_Blue_Defend(mission) {
        if ((Game.time - global.Gtime[this.name]) % 10)
            return;
        if (!this.Check_Lab(mission, 'transport', 'complex'))
            return;
        if ((Game.time - global.Gtime[this.name]) % 20)
            return;
        var enemys = this.find(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                return !isInArray(Memory.whitesheet, creep.owner.username) && (creep.owner.username != 'Invader' && deserveDefend(creep));
            } });
        if (enemys.length <= 0) {
            this.DeleteMission(mission.id);
        }
    }
    /* 双人防御 */
    Task_Double_Defend(mission) {
        if ((Game.time - global.Gtime[this.name]) % 10)
            return;
        if (!this.Check_Lab(mission, 'transport', 'complex'))
            return;
        if ((Game.time - global.Gtime[this.name]) % 20)
            return;
        var enemys = this.find(FIND_HOSTILE_CREEPS, { filter: (creep) => {
                return !isInArray(Memory.whitesheet, creep.owner.username) && (creep.owner.username != '1Invader' && deserveDefend(creep));
            } });
        if (enemys.length <= 0) {
            this.DeleteMission(mission.id);
        }
    }
}

/* power操作常量 */
// queen类型buff是否加持
function isOPWR(stru) {
    if (!stru.effects || stru.effects.length <= 0)
        return false;
    else {
        if (stru.structureType == 'tower') {
            if (!isInArray(getAllEffects(stru), PWR_OPERATE_TOWER))
                return false;
        }
        else if (stru.structureType == 'spawn') {
            if (!isInArray(getAllEffects(stru), PWR_OPERATE_SPAWN))
                return false;
        }
        else if (stru.structureType == 'extension') {
            if (!isInArray(getAllEffects(stru), PWR_OPERATE_EXTENSION))
                return false;
        }
        else if (stru.structureType == 'terminal') {
            if (!isInArray(getAllEffects(stru), PWR_OPERATE_TERMINAL))
                return false;
        }
        else if (stru.structureType == 'storage') {
            if (!isInArray(getAllEffects(stru), PWR_OPERATE_STORAGE))
                return false;
        }
        else if (stru.structureType == 'factory') {
            if (!isInArray(getAllEffects(stru), PWR_OPERATE_FACTORY))
                return false;
        }
        else if (stru.structureType == 'lab') {
            if (!isInArray(getAllEffects(stru), PWR_OPERATE_LAB))
                return false;
        }
        else if (stru.structureType == 'powerSpawn') {
            if (!isInArray(getAllEffects(stru), PWR_OPERATE_POWER))
                return false;
        }
    }
    return true;
}
function getAllEffects(stru) {
    if (!stru.effects || stru.effects.length <= 0)
        return [];
    var eff_list = [];
    for (var effect_ of stru.effects) {
        eff_list.push(effect_.effect);
    }
    return eff_list;
}

/* 超能powercreep相关任务 */
class PowerCreepMisson extends Room {
    /* Pc任务管理器 */
    PowerCreep_TaskManager() {
        if (this.controller.level < 8)
            return;
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_)
            return;
        var pc = Game.powerCreeps[`${this.name}/queen/${Game.shard.name}`];
        var pcspawn = global.Stru[this.name]['powerspawn'];
        if (!pc)
            return;
        else {
            /* 看看是否存活，没存活就孵化 */
            if (!pc.ticksToLive && pcspawn) {
                pc.spawn(pcspawn);
                return;
            }
        }
        this.enhance_storage();
        this.enhance_lab();
        this.enhance_extension();
        this.enhance_spawn();
        this.enhance_tower();
        this.enhance_factory();
        this.enhance_powerspawn();
    }
    /* 挂载增强storage的任务 适用于queen类型pc */
    enhance_storage() {
        if ((Game.time - global.Gtime[this.name]) % 7)
            return;
        if (this.memory.switch.StopEnhanceStorage)
            return;
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_)
            return;
        let pc = Game.powerCreeps[`${this.name}/queen/${Game.shard.name}`];
        if (!pc || !pc.powers[PWR_OPERATE_STORAGE])
            return;
        if (!storage_.effects)
            storage_.effects = [];
        if (!isOPWR(storage_) && this.MissionNum('PowerCreep', '仓库扩容') <= 0) {
            /* 发布任务 */
            var thisTask = {
                name: "仓库扩容",
                delayTick: 40,
                range: 'PowerCreep',
            };
            thisTask.CreepBind = { 'queen': { num: 1, bind: [] } };
            this.AddMission(thisTask);
        }
    }
    /* 挂载增强lab的任务 适用于queen类型pc */
    enhance_lab() {
        if ((Game.time - global.Gtime[this.name]) % 10)
            return;
        if (this.memory.switch.StopEnhanceLab)
            return;
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_)
            return;
        let pc = Game.powerCreeps[`${this.name}/queen/${Game.shard.name}`];
        if (!pc || !pc.powers[PWR_OPERATE_LAB] || pc.powers[PWR_OPERATE_LAB].cooldown)
            return;
        let disTask = this.MissionName('Room', '资源合成');
        if (!disTask)
            return;
        if (this.MissionNum('PowerCreep', '合成加速') > 0)
            return;
        let list = [];
        for (let id of disTask.Data.comData) {
            var lab_ = Game.getObjectById(id);
            if (lab_ && !isOPWR(lab_))
                list.push(id);
        }
        if (list.length <= 0)
            return;
        var thisTask = {
            name: "合成加速",
            delayTick: 50,
            range: 'PowerCreep',
            Data: {
                lab: list
            }
        };
        thisTask.CreepBind = { 'queen': { num: 1, bind: [] } };
        this.AddMission(thisTask);
    }
    /* 挂载防御塔任务 适用于queen类型pc 配合主动防御 */
    enhance_tower() {
        if ((Game.time - global.Gtime[this.name]) % 11)
            return;
        if (this.memory.switch.StopEnhanceTower)
            return;
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_)
            return;
        let pc = Game.powerCreeps[`${this.name}/queen/${Game.shard.name}`];
        if (!pc || !pc.powers[PWR_OPERATE_TOWER] || pc.powers[PWR_OPERATE_TOWER].cooldown)
            return;
        if (this.memory.state == 'war' && this.memory.switch.AutoDefend) {
            let towers_list = [];
            if (this.memory.StructureIdData.AtowerID.length > 0)
                for (var o of this.memory.StructureIdData.AtowerID) {
                    var otower = Game.getObjectById(o);
                    if (otower && !isOPWR(otower)) {
                        towers_list.push(otower.id);
                    }
                }
            if (towers_list.length <= 0 || this.MissionNum('PowerCreep', '塔防增强') > 0)
                return;
            /* 发布任务 */
            var thisTask = {
                name: "塔防增强",
                delayTick: 70,
                range: 'PowerCreep',
                Data: {
                    tower: towers_list
                }
            };
            thisTask.CreepBind = { 'queen': { num: 1, bind: [] } };
            this.AddMission(thisTask);
        }
    }
    /* 挂载填充拓展任务 适用于queen类型pc */
    enhance_extension() {
        if ((Game.time - global.Gtime[this.name]) % 25)
            return;
        if (this.memory.switch.StopEnhanceExtension)
            return;
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_ || storage_.store.getUsedCapacity('energy') < 20000)
            return;
        let pc = Game.powerCreeps[`${this.name}/queen/${Game.shard.name}`];
        if (!pc || !pc.powers[PWR_OPERATE_EXTENSION])
            return;
        if (this.energyAvailable < this.energyCapacityAvailable * 0.3 && this.MissionNum('PowerCreep', '拓展填充') <= 0) {
            var thisTask = {
                name: "扩展填充",
                delayTick: 30,
                range: 'PowerCreep',
                Data: {}
            };
            thisTask.CreepBind = { 'queen': { num: 1, bind: [] } };
            this.AddMission(thisTask);
        }
    }
    /* 挂载spawn加速任务 适用于queen类型pc */
    enhance_spawn() {
        if ((Game.time - global.Gtime[this.name]) % 13)
            return;
        if (this.memory.switch.StopEnhanceSpawn)
            return;
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_)
            return;
        let pc = Game.powerCreeps[`${this.name}/queen/${Game.shard.name}`];
        if (!pc || !pc.powers[PWR_OPERATE_SPAWN])
            return;
        // 在战争时期、对外战争时期，启动
        var ssss = false;
        let list = ['攻防一体', '双人小队', '四人小队', '紧急支援'];
        for (let i of list)
            if (this.MissionNum('Creep', i) > 0)
                ssss = true;
        if (this.memory.state == 'war' && this.memory.switch.AutoDefend)
            ssss = true;
        if (ssss) {
            var thisTask = {
                name: "虫卵强化",
                delayTick: 50,
                range: 'PowerCreep',
                Data: {}
            };
            thisTask.CreepBind = { 'queen': { num: 1, bind: [] } };
            this.AddMission(thisTask);
        }
    }
    /* 挂载升级工厂任务 适用于queen类型pc */
    enhance_factory() {
        if ((Game.time - global.Gtime[this.name]) % 14)
            return;
        if (this.memory.switch.StopEnhanceFactory)
            return;
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_)
            return;
        let pc = Game.powerCreeps[`${this.name}/queen/${Game.shard.name}`];
        if (!pc || !pc.powers[PWR_OPERATE_FACTORY])
            return;
        if (this.MissionNum("Room", '工厂合成') <= 0)
            return;
        var thisTask = {
            name: "工厂强化",
            delayTick: 50,
            range: 'PowerCreep',
            Data: {}
        };
        thisTask.CreepBind = { 'queen': { num: 1, bind: [] } };
        this.AddMission(thisTask);
    }
    /* 挂载powerspawn增强任务 适用于queen类型pc */
    enhance_powerspawn() {
        if ((Game.time - global.Gtime[this.name]) % 13)
            return;
        if (this.memory.switch.StopEnhancePowerSpawn)
            return;
        var storage_ = global.Stru[this.name]['storage'];
        if (!storage_)
            return;
        let pc = Game.powerCreeps[`${this.name}/queen/${Game.shard.name}`];
        if (!pc || !pc.powers[PWR_OPERATE_POWER])
            return;
        if (this.MissionNum("Room", 'power升级') <= 0)
            return;
        var thisTask = {
            name: "power强化",
            delayTick: 50,
            range: 'PowerCreep',
            Data: {}
        };
        thisTask.CreepBind = { 'queen': { num: 1, bind: [] } };
        this.AddMission(thisTask);
    }
}

// 定义好挂载顺序
const plugins$2 = [
    RoomCoreInitExtension,
    RoomFunctionFindExtension,
    RoomCoreSpawnExtension,
    RoomCoreEcosphereExtension,
    RoomMissonFrameExtension,
    RoomMissonPublish,
    RoomFunctionTowerExtension,
    RoomMissonBehaviourExtension,
    RoomMissonTransportExtension,
    RoomMissonVindicateExtension,
    NormalWarExtension,
    RoomMissonManageExtension,
    RoomMissonDefendExtension,
    RoomMissonMineExtension,
    DefendWarExtension,
    PowerCreepMisson,
];
/**
* 依次挂载所有的拓展
*/
var mountRoom = () => plugins$2.forEach(plugin => assignPrototype(Room, plugin));

var frameExtension = {
    /* 绕过房间api */
    bypass: {
        /* 添加要绕过的房间 */
        add(roomNames) {
            if (!Memory.bypassRooms)
                Memory.bypassRooms = [];
            // 确保新增的房间名不会重复
            Memory.bypassRooms = _.uniq([...Memory.bypassRooms, roomNames]);
            return `[bypass]已添加绕过房间 \n ${this.show()}`;
        },
        show() {
            if (!Memory.bypassRooms || Memory.bypassRooms.length <= 0)
                return '[bypass]当前无绕过房间';
            return `[bypass]当前绕过房间列表：${Memory.bypassRooms.join(' ')}`;
        },
        clean() {
            Memory.bypassRooms = [];
            return `[bypass]已清空绕过房间列表，当前列表：${Memory.bypassRooms.join(' ')}`;
        },
        remove(roomNames) {
            if (!Memory.bypassRooms)
                Memory.bypassRooms = [];
            if (roomNames.length <= 0)
                delete Memory.bypassRooms;
            else
                Memory.bypassRooms = _.difference(Memory.bypassRooms, [roomNames]);
            return `[bypass]已移除绕过房间${roomNames}`;
        }
    },
    /* 白名单api */
    whitesheet: {
        add(username) {
            if (!Memory.whitesheet)
                Memory.whitesheet = [];
            Memory.whitesheet = _.uniq([...Memory.whitesheet, username]);
            return `[whitesheet]已添加用户${username}进白名单！\n${this.show()}`;
        },
        show() {
            if (!Memory.whitesheet || Memory.whitesheet.length <= 0)
                return "[whitesheet]当前白名单为空！";
            return `[whitesheet]白名单列表：${Memory.whitesheet.join(' ')}`;
        },
        clean() {
            Memory.whitesheet = [];
            return '[whitesheet]当前白名单已清空';
        },
        remove(username) {
            // if (! (username in Memory.whitesheet)) return `[whitesheet]白名单里没有玩家“${username}”`
            if (!Memory.whitesheet)
                Memory.whitesheet = [];
            if (Memory.whitesheet.length <= 0)
                delete Memory.whitesheet;
            else
                Memory.whitesheet = _.difference(Memory.whitesheet, [username]);
            return `[whitesheet]已移除${username}出白名单`;
        }
    },
    frame: {
        // 添加控制某房间 [添加了房间才会运行代码]
        set(roomName, plan, x, y) {
            let thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[frame] 不存在房间${roomName}`;
            Memory.RoomControlData[roomName] = { arrange: plan, center: [x, y] };
            return `[frame] 房间${roomName}加入房间控制列表，布局${plan}，中心点[${x},${y}]`;
        },
        // 不控制某房间
        remove(roomName) {
            delete Memory.RoomControlData[roomName];
            return `[frame] 删除房间${roomName}出房间控制列表`;
        },
        // 删除某房间的建筑
        del(roomName, x, y, mold) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[frame] 未找到房间${roomName},请确认房间!`;
            var thisPosition = new RoomPosition(x, y, roomName);
            if (thisPosition.GetStructure(mold)) {
                myRoom.unbindMemory(mold, x, y);
                return `[frame] 房间${roomName}已经执行delStructure命令!`;
            }
            else {
                let cons = thisPosition.lookFor(LOOK_CONSTRUCTION_SITES);
                if (cons.length > 0 && cons[0].structureType == mold) {
                    myRoom.unbindMemory(mold, x, y);
                    return `[frame] 房间${roomName}已经执行delStructure命令!`;
                }
            }
            return `[frame] 房间${roomName}未找到相应建筑!`;
        },
        // 查询任务
        task(roomName) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[frame] 未找到房间${roomName},请确认房间!`;
            let result = `[frame] 房间${roomName}任务数据如下:\n`;
            for (var rangeName in myRoom.memory.Misson) {
                if (Object.keys(myRoom.memory.Misson[rangeName]).length <= 0) {
                    result += `不存在${rangeName}类任务\n`;
                }
                else {
                    result += `------------[${rangeName}]-------------\n`;
                    for (var i of myRoom.memory.Misson[rangeName]) {
                        result += `${i.name} | 超时:${i.delayTick}, ID:${i.id}, `;
                        if (i.Data) {
                            if (i.Data.disRoom)
                                result += `目标房间:${i.Data.disRoom}, `;
                            if (i.Data.rType)
                                result += `rType:${i.Data.rType}, `;
                            if (i.Data.num)
                                result += `num:${i.Data.num}, `;
                        }
                        result += `\n`;
                    }
                }
            }
            return result;
        },
        // 经济模式 （不再升级）
        economy(roomName) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[frame] 未找到房间${roomName},请确认房间!`;
            myRoom.memory.economy = !myRoom.memory.economy;
            return `[frame] 房间${roomName}的economy选项改为${myRoom.memory.economy}`;
        }
    },
    spawn: {
        num(roomName, role, num) {
            let thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[spawn] 不存在房间${roomName}`;
            let roleConfig = thisRoom.memory.SpawnConfig[role];
            if (roleConfig) {
                roleConfig.num = num;
                return `[spawn] 房间${roomName}的${role}数量信息修改为${num}`;
            }
            return `[spawn] 房间${roomName}的${role}数量信息修改失败`;
        },
        // 修改某任务爬虫绑定数据的num
        Mnum(roomName, id, role, num) {
            let thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[spawn] 不存在房间${roomName}`;
            let misson = thisRoom.GainMission(id);
            if (misson && misson.CreepBind[role]) {
                misson.CreepBind[role].num = num;
                return `[spawn] 任务${id}的${role}数量信息修改为${num}`;
            }
            return `[spawn] 任务${id}的${role}数量信息修改失败`;
        },
    },
    link: {
        comsume(roomName, id) {
            let thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[link] 不存在房间${roomName}`;
            if (isInArray(thisRoom.memory.StructureIdData.source_links, id))
                return `[link] id错误，不能为source_link`;
            if (id == thisRoom.memory.StructureIdData.center_link || id == thisRoom.memory.StructureIdData.upgrade_link)
                return `[link] id错误，不能为center_link/upgrade_link`;
            if (!isInArray(thisRoom.memory.StructureIdData.comsume_link, id))
                thisRoom.memory.StructureIdData.comsume_link.push(id);
            return Colorful$1(`[link] 房间${roomName} id为${id}的link已加入comsume_link列表中`, 'green', true);
        }
    },
    debug: {
        ResourceDispatch(roomName, rType, num, mtype, buy = false) {
            let dispatchTask = {
                sourceRoom: roomName,
                rType: rType,
                num: num,
                delayTick: 300,
                conditionTick: 20,
                buy: buy,
                mtype: mtype
            };
            Memory.ResourceDispatchData.push(dispatchTask);
            return `[debug] 资源调度任务发布,房间${roomName},资源类型${rType},数量${num},支持购买:${buy},默认超时300T`;
        },
        ResourceBuy(roomName, rType, num, range, max = 35) {
            let thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[link] 不存在房间${roomName}`;
            let task = thisRoom.Public_Buy(rType, num, range, max);
            if (task && thisRoom.AddMission(task))
                return Colorful$1(`[debug] 资源购买任务发布,房间${roomName},资源类型${rType},数量${num},价格范围${range},最高价格${max}`, 'blue');
            return Colorful$1(`[debug] 房间${roomName}资源购买任务发布失败!`, 'yellow');
        }
    },
    dispatch: {
        limit(roomName) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[dispatch] 未找到房间${roomName},请确认房间!`;
            let result = `[dispatch] 房间${roomName}的ResourceLimit信息如下:\n`;
            let data = global.ResourceLimit[roomName];
            if (Object.keys(data).length <= 0)
                return `[dispatch] 房间${roomName}没有ResourceLimit信息!`;
            for (var i of Object.keys(data))
                result += `[${i}] : ${data[i]}\n`;
            return result;
        }
    }
};

var actionExtension = {
    repair: {
        set(roomName, rtype, num, boost, vindicate) {
            let thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[repair] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep'])
                if (i.name == '墙体维护' && i.Data.RepairType == rtype) {
                    return `[repair] 房间${roomName}已经存在类型为${rtype}的刷墙任务了`;
                }
            var thisTask = thisRoom.public_repair(rtype, num, boost, vindicate);
            if (thisRoom.AddMission(thisTask))
                return `[repair] 房间${roomName}挂载类型为${rtype}刷墙任务成功`;
            return `[repair] 房间${roomName}挂载类型为${rtype}刷墙任务失败`;
        },
        remove(roomName, Rtype) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[repair] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep'])
                if (i.name == '墙体维护' && i.Data.RepairType == Rtype) {
                    if (thisRoom.DeleteMission(i.id))
                        return `[repair] 房间${roomName}删除类型为${Rtype}刷墙任务成功`;
                }
            return `[repair] 房间${roomName}删除类型为${Rtype}刷墙任务失败!`;
        },
    },
    plan: {
        C(roomName, disRoom, Cnum, Unum, shard = Game.shard.name) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[plan] 不存在房间${roomName}`;
            let task = thisRoom.public_planC(disRoom, Cnum, Unum, shard);
            if (thisRoom.AddMission(task))
                return Colorful$1(`[plan] 房间${roomName}挂载C计划成功 -> ${disRoom}`, 'green');
            return Colorful$1(`[plan] 房间${roomName}挂载C计划失败 -> ${disRoom}`, 'red');
        },
        CC(roomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[plan] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep'])
                if (i.name == 'C计划') {
                    if (thisRoom.DeleteMission(i.id))
                        return Colorful$1(`[plan] 房间${roomName}删除C计划成功`, 'green');
                }
            return Colorful$1(`[plan] 房间${roomName}删除C计划失败`, 'red');
        }
    },
    expand: {
        set(roomName, disRoom, num, Cnum = 1) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[expand] 不存在房间${roomName}`;
            let task = thisRoom.Public_expand(disRoom, num, Cnum);
            if (thisRoom.AddMission(task))
                return Colorful$1(`[expand] 房间${roomName}挂载扩张援建计划成功 -> ${disRoom}`, 'green');
            return Colorful$1(`[expand] 房间${roomName}挂载扩张援建计划失败 -> ${disRoom}`, 'red');
        },
        remove(roomName, disRoom) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[expand] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep'])
                if (i.name == '扩张援建' && i.Data.disRoom == disRoom) {
                    if (thisRoom.DeleteMission(i.id))
                        return Colorful$1(`[expand] 房间${roomName}删除扩张援建成功`, 'green');
                }
            return Colorful$1(`[expand] 房间${roomName}删除扩张援建失败`, 'red');
        },
    },
    war: {
        dismantle(roomName, disRoom, num, boost, interval) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[war] 不存在房间${roomName}`;
            let interval_ = interval ? interval : 1000;
            let task = thisRoom.Public_dismantle(disRoom, num, interval_, boost);
            if (thisRoom.AddMission(task))
                return Colorful$1(`[war] 房间${roomName}挂载拆迁任务成功 -> ${disRoom}`, 'green');
            return Colorful$1(`[war] 房间${roomName}挂载拆迁任务失败 -> ${disRoom}`, 'red');
        },
        Cdismantle(roomName, disRoom) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[war] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep']) {
                if (i.name == '黄球拆迁' && i.Data.disRoom == disRoom) {
                    if (thisRoom.DeleteMission(i.id))
                        return Colorful$1(`[plan] 房间${roomName}删除拆迁任务成功`, 'green');
                }
            }
            return Colorful$1(`[war] 房间${roomName}删除拆迁任务失败`, 'red');
        },
        support(roomName, disRoom, rType) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[war] 不存在房间${roomName}`;
            let task = thisRoom.Public_support(disRoom, rType, 'shard3');
            if (thisRoom.AddMission(task))
                return Colorful$1(`[war] 房间${roomName}挂载紧急支援任务成功 -> ${disRoom}`, 'green');
            return Colorful$1(`[war] 房间${roomName}挂载紧急支援任务失败 -> ${disRoom}`, 'red');
        },
        Csupport(roomName, disRoom, rType) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[war] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep']) {
                if (i.name == '紧急支援' && i.Data.disRoom == disRoom && i.Data.sType == rType) {
                    if (thisRoom.DeleteMission(i.id))
                        return Colorful$1(`[war] 房间${roomName}紧急支援任务成功`, 'green');
                }
            }
            return Colorful$1(`[war] 房间${roomName}紧急支援任务失败`, 'red');
        },
        control(roomName, disRoom, interval, shard = Game.shard.name) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[war] 不存在房间${roomName}`;
            let task = thisRoom.Public_control(disRoom, shard, interval);
            if (thisRoom.AddMission(task))
                return Colorful$1(`[war] 房间${roomName}挂载控制攻击任务成功 -> ${disRoom}`, 'green');
            return Colorful$1(`[war] 房间${roomName}挂载控制攻击任务失败 -> ${disRoom}`, 'red');
        },
        Ccontrol(roomName, disRoom, shard = Game.shard.name) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[war] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep']) {
                if (i.name == '控制攻击' && i.Data.disRoom == disRoom && i.Data.shard == shard) {
                    if (thisRoom.DeleteMission(i.id))
                        return Colorful$1(`[war] 房间${roomName}控制攻击任务成功`, 'green');
                }
            }
            return Colorful$1(`[war] 房间${roomName}控制攻击任务失败`, 'red');
        },
        aio(roomName, disRoom, CreepNum, shard, time = 1000, boost = true) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[war] 未找到房间${roomName},请确认房间!`;
            var thisTask = myRoom.Public_aio(disRoom, shard, CreepNum, time, boost);
            if (myRoom.AddMission(thisTask))
                return `[war] 攻防一体任务挂载成功! ${Game.shard.name}/${roomName} -> ${shard}/${disRoom}`;
            return `[war] 攻防一体挂载失败!`;
        },
        Caio(roomName, disRoom, shard) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[support] 未找到房间${roomName},请确认房间!`;
            for (var i of myRoom.memory.Misson['Creep']) {
                if (i.name == '攻防一体' && i.Data.disRoom == disRoom && i.Data.shard == shard) {
                    if (myRoom.DeleteMission(i.id))
                        return `[war] 删除去往${shard}/${disRoom}的攻防一体任务成功!`;
                }
            }
            return `[war] 删除去往${shard}/${disRoom}的攻防一体任务失败!`;
        },
        squad(roomName, disRoom, shard, mtype, time = 1000) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[war] 未找到房间${roomName},请确认房间!`;
            let thisTask;
            if (mtype == 'R') {
                thisTask = myRoom.public_squad(disRoom, shard, time, 2, 0, 0, 2, 0, mtype);
            }
            else if (mtype == 'A') {
                thisTask = myRoom.public_squad(disRoom, shard, time, 0, 2, 0, 2, 0, mtype);
            }
            else if (mtype == 'D') {
                thisTask = myRoom.public_squad(disRoom, shard, time, 0, 0, 2, 2, 0, mtype);
            }
            else if (mtype == 'Aio') {
                thisTask = myRoom.public_squad(disRoom, shard, time, 0, 0, 0, 0, 4, mtype);
            }
            else if (mtype == 'RA') {
                thisTask = myRoom.public_squad(disRoom, shard, time, 1, 1, 0, 2, 0, mtype);
            }
            else if (mtype == 'DA') {
                thisTask = myRoom.public_squad(disRoom, shard, time, 0, 1, 1, 2, 0, mtype);
            }
            else if (mtype == 'DR') {
                thisTask = myRoom.public_squad(disRoom, shard, time, 1, 0, 1, 2, 0, mtype);
            }
            if (myRoom.AddMission(thisTask))
                return `[war] 四人小队任务挂载成功! ${Game.shard.name}/${roomName} -> ${shard}/${disRoom}`;
            return `[war] 四人小队挂载失败!`;
        },
        Csquad(roomName, disRoom, shard, mtype) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[war] 未找到房间${roomName},请确认房间!`;
            for (var i of myRoom.memory.Misson['Creep']) {
                if (i.name == '四人小队' && i.Data.disRoom == disRoom && i.Data.shard == shard && i.Data.flag == mtype) {
                    if (myRoom.DeleteMission(i.id))
                        return `[war] 删除去往${shard}/${disRoom}的四人小队任务成功!`;
                }
            }
            return `[war] 删除去往${shard}/${disRoom}的四人小队任务失败!`;
        }
    },
    upgrade: {
        quick(roomName, num, boostType) {
            let thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[upgrade] 不存在房间${roomName}`;
            var thisTask = thisRoom.Public_quick(num, boostType);
            if (thisTask && thisRoom.AddMission(thisTask))
                return `[upgrade] 房间${roomName}挂载急速冲级任务成功`;
            return `[upgrade] 房间${roomName}挂载急速冲级任务失败`;
        },
        Cquick(roomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[repair] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep'])
                if (i.name == '急速冲级') {
                    if (thisRoom.DeleteMission(i.id))
                        return `[upgrade] 房间${roomName}删除急速冲级任务成功`;
                }
            return `[upgrade] 房间${roomName}删除急速冲级任务失败!`;
        },
        Nquick(roomName, num) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[repair] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep'])
                if (i.name == '急速冲级') {
                    i.CreepBind['rush'].num = num;
                    return `[upgrade] 房间${roomName}急速冲级任务数量修改为${num}`;
                }
            return `[upgrade] 房间${roomName}修改急速冲级任务数量失败!`;
        },
    },
    carry: {
        special(roomName, res, sP, dP, CreepNum, ResNum) {
            let thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[carry] 不存在房间${roomName}`;
            let time = 99999;
            if (!ResNum)
                time = 30000;
            var thisTask = thisRoom.Public_Carry({ 'truck': { num: CreepNum ? CreepNum : 1, bind: [] } }, time, sP.roomName, sP.x, sP.y, dP.roomName, dP.x, dP.y, res, ResNum ? ResNum : undefined);
            if (thisRoom.AddMission(thisTask))
                return `[carry] 房间${roomName}挂载special搬运任务成功`;
            return `[carry] 房间${roomName}挂载special搬运任务失败`;
        },
        Cspecial(roomName) {
            let thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[carry] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep'])
                if (i.name == '物流运输' && i.CreepBind['truck'] && i.Data.rType) {
                    if (thisRoom.DeleteMission(i.id))
                        return `[carry] 房间${roomName}删除special搬运任务成功`;
                }
            return `[carry] 房间${roomName}删除special搬运任务失败`;
        },
    },
    support: {
        // 紧急援建
        build(roomName, disRoom, num, interval, shard = Game.shard.name) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[support] 不存在房间${roomName}`;
            let task = thisRoom.Public_helpBuild(disRoom, num, shard, interval);
            if (thisRoom.AddMission(task))
                return Colorful$1(`[support] 房间${roomName}挂载紧急援建任务成功 -> ${disRoom}`, 'green');
            return Colorful$1(`[support] 房间${roomName}挂载紧急援建任务失败 -> ${disRoom}`, 'red');
        },
        Cbuild(roomName, disRoom, shard = Game.shard.name) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[support] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep']) {
                if (i.name == '紧急援建' && i.Data.disRoom == disRoom && i.Data.shard == shard) {
                    if (thisRoom.DeleteMission(i.id))
                        return Colorful$1(`[support] 房间${roomName}紧急援建任务成功`, 'green');
                }
            }
            return Colorful$1(`[support] 房间${roomName}紧急援建任务失败`, 'red');
        },
    },
    /* 核弹相关 */
    nuke: {
        /* 发射核弹 */
        launch(roomName, disRoom, x_, y_) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[nuke]房间错误，请确认房间${roomName}！`;
            var nuke_ = Game.getObjectById(myRoom.memory.StructureIdData.NukerID);
            if (!nuke_)
                return `[nuke]核弹查询错误!`;
            if (nuke_.launchNuke(new RoomPosition(x_, y_, disRoom)) == OK)
                return Colorful$1(`[nuke]${roomName}->${disRoom}的核弹发射成功!预计---500000---ticks后着陆!`, 'yellow', true);
            else
                return Colorful$1(`[nuke]${roomName}->${disRoom}的核弹发射失败!`, 'yellow', true);
        }
    },
    scout: {
        sign(roomName, disRoom, shard, str) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[scout] 不存在房间${roomName}`;
            let task = thisRoom.Public_Sign(disRoom, shard, str);
            if (!task)
                return '[scout] 任务对象生成失败';
            if (thisRoom.AddMission(task))
                return Colorful$1(`[scout] 房间${roomName}挂载房间签名任务成功 -> ${disRoom}`, 'green');
            return Colorful$1(`[scout] 房间${roomName}挂载房间签名任务失败 -> ${disRoom}`, 'red');
        },
        Csign(roomName, disRoom, shard) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[scout] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep']) {
                if (i.name == '房间签名' && i.Data.disRoom == disRoom && i.Data.shard == shard) {
                    if (thisRoom.DeleteMission(i.id))
                        return Colorful$1(`[scout] 房间${roomName}房间签名任务成功`, 'green');
                }
            }
            return Colorful$1(`[scout] 房间${roomName}房间签名任务失败`, 'red');
        },
    },
};

/* 全局资源常量     轮子-非自己开发! */
const base = [
    RESOURCE_ENERGY,
    RESOURCE_UTRIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_KEANIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST,
    RESOURCE_OXYGEN,
    RESOURCE_HYDROGEN,
    RESOURCE_POWER,
    RESOURCE_OPS,
];
const bar = [
    RESOURCE_BATTERY,
    RESOURCE_UTRIUM_BAR,
    RESOURCE_LEMERGIUM_BAR,
    RESOURCE_KEANIUM_BAR,
    RESOURCE_ZYNTHIUM_BAR,
    RESOURCE_PURIFIER,
    RESOURCE_OXIDANT,
    RESOURCE_REDUCTANT,
    RESOURCE_GHODIUM_MELT,
];
const commodityBase = [RESOURCE_COMPOSITE, RESOURCE_CRYSTAL, RESOURCE_LIQUID];
const commodityMetal = [
    RESOURCE_METAL,
    RESOURCE_ALLOY,
    RESOURCE_TUBE,
    RESOURCE_FIXTURES,
    RESOURCE_FRAME,
    RESOURCE_HYDRAULICS,
    RESOURCE_MACHINE,
];
const commodityBiomass = [
    RESOURCE_BIOMASS,
    RESOURCE_CELL,
    RESOURCE_PHLEGM,
    RESOURCE_TISSUE,
    RESOURCE_MUSCLE,
    RESOURCE_ORGANOID,
    RESOURCE_ORGANISM,
];
const commoditySilicon = [
    RESOURCE_SILICON,
    RESOURCE_WIRE,
    RESOURCE_SWITCH,
    RESOURCE_TRANSISTOR,
    RESOURCE_MICROCHIP,
    RESOURCE_CIRCUIT,
    RESOURCE_DEVICE,
];
const commodityMist = [
    RESOURCE_MIST,
    RESOURCE_CONDENSATE,
    RESOURCE_CONCENTRATE,
    RESOURCE_EXTRACT,
    RESOURCE_SPIRIT,
    RESOURCE_EMANATION,
    RESOURCE_ESSENCE,
];
const boostBase = [RESOURCE_HYDROXIDE, RESOURCE_ZYNTHIUM_KEANITE, RESOURCE_UTRIUM_LEMERGITE, RESOURCE_GHODIUM];
const boostU = [
    RESOURCE_UTRIUM_HYDRIDE,
    RESOURCE_UTRIUM_ACID,
    RESOURCE_CATALYZED_UTRIUM_ACID,
    RESOURCE_UTRIUM_OXIDE,
    RESOURCE_UTRIUM_ALKALIDE,
    RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
];
const boostK = [
    RESOURCE_KEANIUM_HYDRIDE,
    RESOURCE_KEANIUM_ACID,
    RESOURCE_CATALYZED_KEANIUM_ACID,
    RESOURCE_KEANIUM_OXIDE,
    RESOURCE_KEANIUM_ALKALIDE,
    RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
];
const boostL = [
    RESOURCE_LEMERGIUM_HYDRIDE,
    RESOURCE_LEMERGIUM_ACID,
    RESOURCE_CATALYZED_LEMERGIUM_ACID,
    RESOURCE_LEMERGIUM_OXIDE,
    RESOURCE_LEMERGIUM_ALKALIDE,
    RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
];
const boostZ = [
    RESOURCE_ZYNTHIUM_HYDRIDE,
    RESOURCE_ZYNTHIUM_ACID,
    RESOURCE_CATALYZED_ZYNTHIUM_ACID,
    RESOURCE_ZYNTHIUM_OXIDE,
    RESOURCE_ZYNTHIUM_ALKALIDE,
    RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
];
const boostG = [
    RESOURCE_GHODIUM_HYDRIDE,
    RESOURCE_GHODIUM_ACID,
    RESOURCE_CATALYZED_GHODIUM_ACID,
    RESOURCE_GHODIUM_OXIDE,
    RESOURCE_GHODIUM_ALKALIDE,
    RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
];
const resourceList = {
    base,
    bar,
    commodityBase,
    commodityMetal,
    commodityBiomass,
    commoditySilicon,
    commodityMist,
    boostBase,
    boostU,
    boostK,
    boostL,
    boostZ,
    boostG,
};
const resourceColorMap = {
    [RESOURCE_ENERGY]: '#fff200',
    [RESOURCE_UTRIUM]: '#4ca7e5',
    [RESOURCE_KEANIUM]: '#da6Bf5',
    [RESOURCE_LEMERGIUM]: '#6cf0a9',
    [RESOURCE_ZYNTHIUM]: '#f7d492',
    [RESOURCE_CATALYST]: '#ffc0cb',
    [RESOURCE_GHODIUM]: '#fff',
    [RESOURCE_BATTERY]: '#fff200',
    [RESOURCE_ZYNTHIUM_BAR]: '#f7d492',
    [RESOURCE_LEMERGIUM_BAR]: '#6cf0a9',
    [RESOURCE_UTRIUM_BAR]: '#4ca7e5',
    [RESOURCE_KEANIUM_BAR]: '#da6bf5',
    [RESOURCE_PURIFIER]: '#ffc0cb',
    [RESOURCE_GHODIUM_MELT]: '#fff',
    [RESOURCE_POWER]: '#e05a5a',
    [RESOURCE_OPS]: '#e05a5a',
};

/* 展示全局资源相关     轮子-非自己开发! */
const addStore = (resource, store) => {
    for (const key in store) {
        if (store[key] > 0)
            resource[key] = (resource[key] || 0) + store[key];
    }
    return resource;
};
const getCatteryResource = (cattery) => {
    const resource = {};
    if (cattery.storage)
        addStore(resource, cattery.storage.store);
    if (cattery.terminal)
        addStore(resource, cattery.terminal.store);
    return resource;
};
const uniqueColor = (str, resType) => {
    return `<span class='resource-name' style='position: relative; color: ${resourceColorMap[resType] || 'inherited'}'>${str}</span>`;
};
const allResource = () => {
    const time = Game.cpu.getUsed();
    const myCatteries = Object.values(Game.rooms).filter((cattery) => { var _a; return (_a = cattery.controller) === null || _a === void 0 ? void 0 : _a.my; });
    const catteriesResource = {};
    myCatteries.forEach((cattery) => {
        catteriesResource[cattery.name] = getCatteryResource(cattery);
    });
    const allResource = myCatteries.reduce((all, room) => addStore(all, catteriesResource[room.name]), {});
    const addRoomList = (text, resType) => {
        let str = text;
        if (allResource[resType]) {
            str += `<div class='resource-room' style='position: absolute; display: none; top: 100%; right: 0; padding: 5px; background: #333; color: #ccc; border: 1px solid #ccc; border-radius: 5px; z-index: 10;'>`;
            for (const key in catteriesResource) {
                if (catteriesResource[key][resType])
                    str += `${_.padRight(key, 6)}: ${_.padLeft((catteriesResource[key][resType] || 0).toLocaleString(), 9)}<br/>`;
            }
            str += '</div>';
        }
        return str;
    };
    const addList = (list, color) => {
        let str = `<div style='position: relative; color: ${color};'>`;
        list.forEach((res) => (str += uniqueColor(_.padLeft(res, 15), res)));
        str += '<br/>';
        list.forEach((res) => (str += uniqueColor(addRoomList(_.padLeft((allResource[res] || 0).toLocaleString(), 15), res), res)));
        str += '<br/></div>';
        return str;
    };
    let str = '<br/>基础资源:<br/>';
    str += addList(resourceList.base);
    str += '<br/>压缩资源:<br/>';
    str += addList(resourceList.bar);
    str += '<br/>商品资源:<br/>';
    str += addList(resourceList.commodityBase);
    str += addList(resourceList.commodityMetal, resourceColorMap[RESOURCE_ZYNTHIUM]);
    str += addList(resourceList.commodityBiomass, resourceColorMap[RESOURCE_LEMERGIUM]);
    str += addList(resourceList.commoditySilicon, resourceColorMap[RESOURCE_UTRIUM]);
    str += addList(resourceList.commodityMist, resourceColorMap[RESOURCE_KEANIUM]);
    str += '<br/>LAB资源:<br/>';
    str += addList(resourceList.boostBase);
    str += addList(resourceList.boostU, resourceColorMap[RESOURCE_UTRIUM]);
    str += addList(resourceList.boostK, resourceColorMap[RESOURCE_KEANIUM]);
    str += addList(resourceList.boostL, resourceColorMap[RESOURCE_LEMERGIUM]);
    str += addList(resourceList.boostZ, resourceColorMap[RESOURCE_ZYNTHIUM]);
    str += addList(resourceList.boostG, resourceColorMap[RESOURCE_GHODIUM_MELT]);
    str += `<script>$('.resource-name').hover(function() { $(this).find('.resource-room').show() }, function() { $(this).find('.resource-room').hide() })</script>`;
    console.log(str);
    console.log(`cpu: ${Game.cpu.getUsed() - time}`);
};
const roomResource = (roomName) => {
    const time = Game.cpu.getUsed();
    const myCatteries = [Game.rooms[roomName]];
    const catteriesResource = {};
    myCatteries.forEach((cattery) => {
        catteriesResource[cattery.name] = getCatteryResource(cattery);
    });
    const allResource = myCatteries.reduce((all, room) => addStore(all, catteriesResource[room.name]), {});
    const addRoomList = (text, resType) => {
        let str = text;
        if (allResource[resType]) {
            str += `<div class='resource-room' style='position: absolute; display: none; top: 100%; right: 0; padding: 5px; background: #333; color: #ccc; border: 1px solid #ccc; border-radius: 5px; z-index: 10;'>`;
            for (const key in catteriesResource) {
                if (catteriesResource[key][resType])
                    str += `${_.padRight(key, 6)}: ${_.padLeft((catteriesResource[key][resType] || 0).toLocaleString(), 9)}<br/>`;
            }
            str += '</div>';
        }
        return str;
    };
    const addList = (list, color) => {
        let str = `<div style='position: relative; color: ${color};'>`;
        list.forEach((res) => (str += uniqueColor(_.padLeft(res, 15), res)));
        str += '<br/>';
        list.forEach((res) => (str += uniqueColor(addRoomList(_.padLeft((allResource[res] || 0).toLocaleString(), 15), res), res)));
        str += '<br/></div>';
        return str;
    };
    let str = '<br/>基础资源:<br/>';
    str += addList(resourceList.base);
    str += '<br/>压缩资源:<br/>';
    str += addList(resourceList.bar);
    str += '<br/>商品资源:<br/>';
    str += addList(resourceList.commodityBase);
    str += addList(resourceList.commodityMetal, resourceColorMap[RESOURCE_ZYNTHIUM]);
    str += addList(resourceList.commodityBiomass, resourceColorMap[RESOURCE_LEMERGIUM]);
    str += addList(resourceList.commoditySilicon, resourceColorMap[RESOURCE_UTRIUM]);
    str += addList(resourceList.commodityMist, resourceColorMap[RESOURCE_KEANIUM]);
    str += '<br/>LAB资源:<br/>';
    str += addList(resourceList.boostBase);
    str += addList(resourceList.boostU, resourceColorMap[RESOURCE_UTRIUM]);
    str += addList(resourceList.boostK, resourceColorMap[RESOURCE_KEANIUM]);
    str += addList(resourceList.boostL, resourceColorMap[RESOURCE_LEMERGIUM]);
    str += addList(resourceList.boostZ, resourceColorMap[RESOURCE_ZYNTHIUM]);
    str += addList(resourceList.boostG, resourceColorMap[RESOURCE_GHODIUM_MELT]);
    str += `<script>$('.resource-name').hover(function() { $(this).find('.resource-room').show() }, function() { $(this).find('.resource-room').hide() })</script>`;
    console.log(str);
    console.log(`cpu: ${Game.cpu.getUsed() - time}`);
};

const colors$1 = {
    red: '#ef9a9a',
    green: '#6b9955',
    yellow: '#c5c599',
    blue: '#8dc5e3'
};
function getColor(val) {
    if (val > 100)
        val = 100;
    //let 百分之一 = (单色值范围) / 50;  单颜色的变化范围只在50%之内
    let per = (255 + 255) / 100;
    let r = 0;
    let g = 0;
    let b = 0;
    if (val < 50) {
        // 比例小于50的时候红色是越来越多的,直到红色为255时(红+绿)变为黄色.
        r = per * val;
        g = 255;
    }
    if (val >= 50) {
        // 比例大于50的时候绿色是越来越少的,直到0 变为纯红
        g = 255 - ((val - 50) * per);
        r = 255;
    }
    r = Math.ceil(r); // 取整
    g = Math.ceil(g); // 取整
    b = Math.ceil(b); // 取整
    return "rgb(" + r + "," + g + "," + b + ")";
}
function colorHex(color) {
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(color)) {
        let aColor = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        let strHex = "#";
        for (let i = 0; i < aColor.length; i++) {
            let hex = Number(aColor[i]).toString(16);
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = color;
        }
        return strHex;
    }
    else if (reg.test(color)) {
        let aNum = color.replace(/#/, "").split("");
        if (aNum.length === 6) {
            return color;
        }
        else if (aNum.length === 3) {
            let numHex = "#";
            for (let i = 0; i < aNum.length; i++) {
                numHex += (aNum[i] + aNum[i]);
            }
            return numHex;
        }
    }
    else {
        return color;
    }
}
function Colorful(content, colorName = null, bolder = false) {
    const colorStyle = colorName ? `color: ${colors$1[colorName] ? colors$1[colorName] : colorName};` : '';
    const bolderStyle = bolder ? 'font-weight: bolder;' : '';
    return `<text style="${[colorStyle, bolderStyle].join(' ')}">${content}</text>`;
}
function getRooms() {
    let rooms = [];
    for (let name in Memory.RoomControlData) {
        if (Game.rooms[name])
            rooms.push(name);
    }
    return rooms;
}
function getStore(roomName) {
    if (roomName) {
        let storage = Game.rooms[roomName].storage;
        let terminal = Game.rooms[roomName].terminal;
        let factory = Game.getObjectById(Game.rooms[roomName].memory.StructureIdData ? Game.rooms[roomName].memory.StructureIdData.FactoryId : '');
        let storageUsed = (storage === null || storage === void 0 ? void 0 : storage.store.getUsedCapacity()) || 0;
        let storeCapacity = (storage === null || storage === void 0 ? void 0 : storage.store.getCapacity()) || 1;
        let storageProportion = (storageUsed / storeCapacity * 100).toFixed(2) + '%';
        let storageColor = colorHex(getColor(Math.ceil(storageUsed / storeCapacity * 100)));
        let terminalUsed = (terminal === null || terminal === void 0 ? void 0 : terminal.store.getUsedCapacity()) || 0;
        let terminalCapacity = (terminal === null || terminal === void 0 ? void 0 : terminal.store.getCapacity()) || 1;
        let terminalProportion = (terminalUsed / terminalCapacity * 100).toFixed(2) + '%';
        let terminalColor = colorHex(getColor(Math.ceil(terminalUsed / terminalCapacity * 100)));
        let factoryUsed = (factory === null || factory === void 0 ? void 0 : factory.store.getUsedCapacity()) || 0;
        let factoryCapacity = (factory === null || factory === void 0 ? void 0 : factory.store.getCapacity()) || 1;
        let factoryProportion = (factoryUsed / factoryCapacity * 100).toFixed(2) + '%';
        let factoryColor = colorHex(getColor(Math.ceil(factoryUsed / factoryCapacity * 100)));
        console.log(Colorful(roomName, 'blue'), 'Storage:', Colorful(storageProportion, storageColor), ' ', 'Terminal', Colorful(terminalProportion, terminalColor), ' ', 'Factory', Colorful(factoryProportion, factoryColor));
    }
    else {
        let rooms = getRooms();
        for (let i = 0; i < rooms.length; i++) {
            let storage = Game.rooms[rooms[i]].storage;
            let terminal = Game.rooms[rooms[i]].terminal;
            let factory = Game.getObjectById(Game.rooms[rooms[i]].memory.StructureIdData ? Game.rooms[rooms[i]].memory.StructureIdData.FactoryId : '');
            let storageUsed = (storage === null || storage === void 0 ? void 0 : storage.store.getUsedCapacity()) || 0;
            let storeCapacity = (storage === null || storage === void 0 ? void 0 : storage.store.getCapacity()) || 1;
            let storageProportion = (storageUsed / storeCapacity * 100).toFixed(2) + '%';
            let storageColor = colorHex(getColor(Math.ceil(storageUsed / storeCapacity * 100)));
            let terminalUsed = (terminal === null || terminal === void 0 ? void 0 : terminal.store.getUsedCapacity()) || 0;
            let terminalCapacity = (terminal === null || terminal === void 0 ? void 0 : terminal.store.getCapacity()) || 1;
            let terminalProportion = (terminalUsed / terminalCapacity * 100).toFixed(2) + '%';
            let terminalColor = colorHex(getColor(Math.ceil(terminalUsed / terminalCapacity * 100)));
            let factoryUsed = (factory === null || factory === void 0 ? void 0 : factory.store.getUsedCapacity()) || 0;
            let factoryCapacity = (factory === null || factory === void 0 ? void 0 : factory.store.getCapacity()) || 1;
            let factoryProportion = (factoryUsed / factoryCapacity * 100).toFixed(2) + '%';
            let factoryColor = colorHex(getColor(Math.ceil(factoryUsed / factoryCapacity * 100)));
            console.log(Colorful(rooms[i], 'blue'), 'Storage:', Colorful(storageProportion, storageColor), ' ', 'Terminal', Colorful(terminalProportion, terminalColor), ' ', 'Factory', Colorful(factoryProportion, factoryColor));
            // Colorful(string, colorHex(getColor(Math.ceil(storageUsed / storeCapacity * 100))))
        }
    }
}

/* 与资源相关的 */
var staticExtension = {
    resource: {
        all() {
            allResource();
            return `[resource] 全局资源统计完毕!`;
        },
        room(roomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[resource] 不存在房间${roomName}`;
            roomResource(roomName);
            return `[resource] 房间${roomName}资源统计完毕!`;
        },
    },
    store: {
        all() {
            getStore();
            return `[store] 全局容量信息统计完毕!`;
        },
        room(roomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[store] 不存在房间${roomName}`;
            getStore(roomName);
            return `[store] 房间${roomName}容量信息统计完毕!`;
        }
    },
    /* 任务输出调试屏蔽 */
    MissionVisual: {
        add(name) {
            if (!isInArray(Memory.ignoreMissonName, name))
                Memory.ignoreMissonName.push(name);
            return `[ignore] 已经将任务${name}添加进输出调试的忽略名单里!`;
        },
        remove(name) {
            if (isInArray(Memory.ignoreMissonName, name)) {
                var index = Memory.ignoreMissonName.indexOf(name);
                Memory.ignoreMissonName.splice(index, 1);
                return `[ignore] 已经将任务${name}删除出输出调试的忽略名单里!`;
            }
            return `[ignore] 删除 ${name} 出调试输出忽略名单失败!`;
        },
    },
};

var behaviourExtension = {
    /* 终端行为 */
    terminal: {
        // 默认最多8个传送任务
        send(roomName, disRoom, rType, num) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[terminal] 不存在房间${roomName}`;
            var thisTask = thisRoom.Public_Send(disRoom, rType, num);
            /* 查看资源是否足够 */
            var terminal_ = Game.getObjectById(thisRoom.memory.StructureIdData.terminalID);
            var storage_ = Game.getObjectById(thisRoom.memory.StructureIdData.storageID);
            if (!terminal_ || !storage_) {
                delete thisRoom.memory.StructureIdData.terminalID;
                delete thisRoom.memory.StructureIdData.storageID;
                return Colorful$1(`[terminal] 房间${roomName}不存在终端/仓房或记忆未更新！`, 'red', true);
            }
            /* 查询其他资源传送任务中是否有一样的资源 */
            var Num = 0;
            if (!thisRoom.memory.Misson['Structure'])
                thisRoom.memory.Misson['Structure'] = [];
            for (var tM of thisRoom.memory.Misson['Structure']) {
                if (tM.name == '资源传送' && tM.Data.rType == rType)
                    Num += tM.Data.num;
            }
            /* 计算资源是否满足 */
            if (terminal_.store.getUsedCapacity(rType) + storage_.store.getUsedCapacity(rType) - Num < num)
                return Colorful$1(`[terminal] 房间${roomName} 资源${rType} 数量总合少于 ${num}，传送任务挂载失败！`, 'yellow', true);
            /* 计算路费 */
            var cost = Game.market.calcTransactionCost(num, roomName, disRoom);
            if (terminal_.store.getUsedCapacity('energy') + storage_.store.getUsedCapacity('energy') < cost || cost > 150000)
                return Colorful$1(`[terminal] 房间${roomName}-->${disRoom}资源${rType}所需路费少于 ${cost}或大于150000，传送任务挂载失败！`, 'yellow', true);
            if (thisRoom.AddMission(thisTask))
                return Colorful$1(`[terminal] 房间${roomName}-->${disRoom}资源${rType}传送挂载成功！数量：${num}；路费：${cost}`, 'green', true);
            return Colorful$1(`[terminal] 房间${roomName}-->${disRoom}资源${rType}传送 不明原因挂载失败！`, 'red', true);
        },
        Csend(roomName, disRoom, rType) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[terminal] 不存在房间${roomName}`;
            for (var tM of thisRoom.memory.Misson['Structure']) {
                if (tM.name == '资源传送' && tM.Data.rType == rType && tM.Data.disRoom == disRoom) {
                    if (thisRoom.DeleteMission(tM.id))
                        return Colorful$1(`[terminal] 房间${roomName}-->${disRoom}资源${rType}传送任务删除成功!`, 'blue', true);
                }
            }
            return Colorful$1(`[terminal] 房间${roomName}-->${disRoom}资源${rType}传送 不明原因删除失败！`, 'red', true);
        },
        /* 查看目前房间/全局的资源传送任务 */
        show(roomName) {
            var roomList = [];
            if (roomName)
                roomList = [roomName];
            else {
                if (!Memory.RoomControlData)
                    Memory.RoomControlData = {};
                for (var rN in Memory.RoomControlData) {
                    roomList.push(rN);
                }
            }
            if (roomList.length <= 0)
                return `[terminal] 未发现房间！`;
            for (var rN of roomList) {
                if (!Game.rooms[rN])
                    return `[terminal] 不存在房间${rN}！`;
            }
            var str = '';
            for (var rN of roomList) {
                if (!Game.rooms[rN].memory.Misson['Structure'])
                    Game.rooms[rN].memory.Misson['Structure'] = [];
                if (Game.rooms[rN].MissionNum('Structure', '资源传送') <= 0)
                    continue;
                str += '房间 ' + Colorful$1(`${rN}`, 'yellow', true) + '：\n';
                for (var m of Game.rooms[rN].memory.Misson['Structure']) {
                    if (m.name == '资源传送') {
                        str += '    ' + `-->${m.Data.disRoom} | 资源：${m.Data.rType} | 数量：` + m.Data.num + ' \n';
                    }
                }
            }
            if (str == '')
                return `[terminal] 未发现资源传送任务！`;
            return str;
        },
    },
    /* 外矿 */
    mine: {
        harvest(roomName, x, y, disRoom) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[mine] 不存在房间${roomName}`;
            var thisTask = thisRoom.public_OutMine(roomName, x, y, disRoom);
            thisTask.maxTime = 8;
            if (thisRoom.AddMission(thisTask))
                return `[mine] ${roomName} -> ${disRoom} 的外矿任务挂载成功！`;
            return `[mine] ${roomName} -> ${disRoom} 的外矿任务挂载失败！`;
        },
        Charvest(roomName, disRoom) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[mine] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep']) {
                if (i.name == '外矿开采' && i.Data.disRoom == disRoom) {
                    if (thisRoom.DeleteMission(i.id)) {
                        if (Memory.outMineData[disRoom])
                            delete Memory.outMineData[disRoom];
                        return `[mine] ${roomName} -> ${disRoom} 的外矿任务删除成功！`;
                    }
                }
            }
            return `[mine] ${roomName} -> ${disRoom} 的外矿任务删除失败！`;
        },
        road(roomName) {
            if (!Game.rooms[roomName])
                return `[mine] 不存在相应视野`;
            let roads = Game.rooms[roomName].find(FIND_STRUCTURES, { filter: (stru) => {
                    return stru.structureType == 'road';
                } });
            let cons = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES, { filter: (cons) => {
                    return cons.structureType == 'road';
                } });
            // 去除road记忆
            for (var i of Memory.outMineData[roomName].road) {
                let pos_ = unzipPosition(i);
                if (pos_.roomName == roomName && !pos_.GetStructure('road')) {
                    let index = Memory.outMineData[roomName].road.indexOf(i);
                    Memory.outMineData[roomName].road.splice(index, 1);
                }
            }
            let posList = [];
            for (let r of roads)
                posList.push(zipPosition(r.pos));
            for (let c of cons)
                posList.push(zipPosition(c.pos));
            for (let p of posList) {
                if (!isInArray(Memory.outMineData[roomName].road, p))
                    Memory.outMineData[roomName].road.push(p);
            }
            return `[mine] 已经更新房间${roomName}的外矿信息!`;
        },
    },
    /* 市场 */
    market: {
        // 交易订单
        deal(roomName, id, amount) {
            return Game.market.deal(id, amount, roomName);
        },
        // 查询订单
        look(rType, marType) {
            var HistoryList = Game.market.getHistory(rType);
            var allNum = 0;
            for (var ii of HistoryList) {
                allNum += ii.avgPrice;
            }
            var avePrice = allNum / HistoryList.length;
            var list = Game.market.getAllOrders({ type: marType, resourceType: rType });
            /* 按照价格从上到下 */
            var newList = list.sort(compare('price'));
            var result = `当前市场上资源${rType}的${marType}订单如下:\n`;
            if (isInArray(['pixel', 'access_key', 'cpu_unlock'], rType)) {
                for (var i of list) {
                    result += `\tID:${i.id} 数量:${i.amount} 价格:${i.price} 坐标:${i.roomName} \n`;
                }
                return result;
            }
            for (var i of newList) {
                var priceColor = 'green';
                var roomColor = 'green';
                if (i.price > avePrice && i.price - avePrice > 10)
                    priceColor = 'red';
                if (i.price > avePrice && i.price - avePrice <= 10)
                    priceColor = 'yellow';
                if (i.price <= avePrice)
                    priceColor = 'green';
                LoopB: for (var roomName in Memory.RoomControlData) {
                    var cost = Game.market.calcTransactionCost(1000, roomName, i.roomName);
                    if (cost >= 7000) {
                        roomColor = 'red';
                        break LoopB;
                    }
                    else if (cost < 700 && cost >= 500) {
                        roomColor = 'yellow';
                        break LoopB;
                    }
                    roomColor = 'green';
                }
                result += `\tID:${i.id} ` + `数量:${i.amount} 价格:` + Colorful$1(`${i.price}`, priceColor ? priceColor : 'blue', true) + ` 坐标: ` + Colorful$1(`${i.roomName}`, roomColor ? roomColor : 'blue', true) + ' \n';
            }
            return result;
        },
        // 下买订单
        buy(roomName, rType, price, amount) {
            var result = Game.market.createOrder({
                type: 'buy',
                resourceType: rType,
                price: price,
                totalAmount: amount,
                roomName: roomName
            });
            if (result == OK)
                return `[market] ` + Colorful$1(`买资源${rType}的订单下达成功！ 数量为${amount},价格为${price}`, 'blue', true);
            else
                return `[market] ` + Colorful$1(`买资源${rType}的订单出现错误，不能下达！`, 'red', true);
        },
        // 查询平均价格
        ave(rType, day = 1) {
            return `[market] 资源${rType}在近${day}天内的平均价格为${avePrice(rType, day)}`;
        },
        // 查询是否有订单
        have(roomName, res, mtype, p = null, r = null) {
            let result = haveOrder(roomName, res, mtype, p, r);
            if (p)
                return `[market] 房间:${roomName};资源:${res};类型:${mtype}[价格:${p + r}以上]的单子--->${result ? "有" : "没有"}`;
            else
                return `[market] 房间:${roomName};资源:${res};类型:${mtype}的单子--->${result ? "有" : "没有"}`;
        },
        // 查询市场上的最高价格
        highest(rType, mtype, mprice = 0) {
            let result = highestPrice(rType, mtype, mprice);
            if (mprice)
                return `[market] 资源:${rType};类型:${mtype} 最高价格${result}[低于${mprice}]`;
            else
                return `[market] 资源:${rType};类型:${mtype} 最高价格${result}`;
        },
        // 卖资源
        sell(roomName, rType, mType, num, price, unit = 2000) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[support] 不存在房间${roomName}`;
            if (!thisRoom.memory.market)
                thisRoom.memory.market = {};
            if (mType == 'order') {
                if (!thisRoom.memory.market['order'])
                    thisRoom.memory.market['order'] = [];
                var bR = true;
                for (var od of thisRoom.memory.market['order']) {
                    if (od.rType == rType)
                        bR = false;
                }
                if (bR) {
                    thisRoom.memory.market['order'].push({ rType: rType, num: num, unit: unit });
                    return `[market] 房间${roomName}成功下达order的资源卖出指令,type:sell,rType:${rType},num:${num},unit:${unit}`;
                }
                else
                    return `[market] 房间${roomName}已经存在${rType}的sell订单了`;
            }
            else if (mType == 'deal') {
                if (!thisRoom.memory.market['deal'])
                    thisRoom.memory.market['deal'] = [];
                var bR = true;
                for (var od of thisRoom.memory.market['deal']) {
                    if (od.rType == rType)
                        bR = false;
                }
                if (bR) {
                    thisRoom.memory.market['deal'].push({ rType: rType, num: num, price: price, unit: unit });
                    return `[market] 房间${roomName}成功下达deal的资源卖出指令,type:sell,rType:${rType},num:${num},price:${price},unit:${unit}`;
                }
                else
                    return `[market] 房间${roomName}已经存在${rType}的sell订单了`;
            }
        },
        // 查询正在卖的资源
        query(roomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[support] 不存在房间${roomName}`;
            let result = `[market] 目前房间${roomName}存在如下资源卖出订单:\n`;
            for (var mtype in thisRoom.memory.market)
                for (var i of thisRoom.memory.market[mtype])
                    result += `[${mtype}] 资源:${i.rType} 数量:${i.num}\n`;
            return result;
        },
        // 取消卖资源
        cancel(roomName, mtype, rType) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[support] 不存在房间${roomName}`;
            for (let i of thisRoom.memory.market[mtype]) {
                if (i.rType == rType) {
                    if (mtype == 'order') {
                        if (i.rType != 'energy')
                            delete thisRoom.memory.TerminalData[i.rType];
                        let order = Game.market.getOrderById(i.id);
                        if (order)
                            Game.market.cancelOrder(order.id);
                        var index = thisRoom.memory.market['order'].indexOf(i);
                        thisRoom.memory.market['order'].splice(index, 1);
                        return Colorful$1(`[market] 房间${roomName}取消资源[${rType}----${mtype}]卖出配置成功`, 'blue');
                    }
                    else {
                        if (i.rType != 'energy')
                            delete thisRoom.memory.TerminalData[i.rType];
                        var index = thisRoom.memory.market['deal'].indexOf(i);
                        thisRoom.memory.market['deal'].splice(index, 1);
                        return Colorful$1(`[market] 房间${roomName}取消资源[${rType}----${mtype}]卖出配置成功`, 'blue');
                    }
                }
            }
            return Colorful$1(`[market] 房间${roomName}取消资源[${rType}----${mtype}]卖出配置失败`, 'red');
        },
    },
    /* lab */
    lab: {
        init(roomName) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[lab] 未找到房间${roomName},请确认房间!`;
            /* 初始化 原先配置清零 */
            myRoom.memory.StructureIdData.labInspect = {};
            let result = RecognizeLab(roomName);
            if (result == null)
                return `[lab] 房间${roomName}初始化合成lab信息失败!`;
            myRoom.memory.StructureIdData.labInspect['raw1'] = result.raw1;
            myRoom.memory.StructureIdData.labInspect['raw2'] = result.raw2;
            myRoom.memory.StructureIdData.labInspect['com'] = result.com;
            let str = '';
            str += `[lab] 房间${roomName}初始化lab信息成功!\n`;
            str += `底物lab:\n${result.raw1}\n${result.raw2}\n`;
            str += "合成lab:\n";
            for (let i of result.com)
                str += `${i}\n`;
            return str;
        },
        compound(roomName, res, num) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[lab] 未找到房间${roomName},请确认房间`;
            let str = [];
            for (var i of myRoom.memory.StructureIdData.labInspect.com) {
                if (!myRoom.memory.RoomLabBind[i])
                    str.push(i);
            }
            var thisTask = myRoom.public_Compound(num, res, str);
            if (thisTask === null)
                return `[lab] 挂载合成任务失败!`;
            if (myRoom.AddMission(thisTask))
                return `[lab] 房间${roomName}合成${res}任务挂载成功! ${thisTask.Data.raw1} + ${thisTask.Data.raw2} = ${res}`;
            else
                return `[lab] 房间${roomName}挂载合成任务失败!`;
        },
        dispatch(roomName, res, num) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[lab] 未找到房间${roomName},请确认房间!`;
            if (!resourceComDispatch[res])
                return `不存在资源${res}!`;
            if (Object.keys(myRoom.memory.ComDispatchData).length > 0)
                return `[lab] 房间${roomName} 已经存在资源合成调度数据`;
            myRoom.memory.ComDispatchData = {};
            for (var i of resourceComDispatch[res]) {
                myRoom.memory.ComDispatchData[i] = { res: i, dispatch_num: num };
            }
            return `[lab] 已经修改房间${roomName}的合成规划数据，为${resourceComDispatch[res]}，数量：${num}`;
        },
        Cdispatch(roomName) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[lab] 未找到房间${roomName},请确认房间!`;
            myRoom.memory.ComDispatchData = {};
            return `[lab] 已经修改房间${roomName}的资源调度数据，为{}.本房见现已无资源合成调度`;
        },
    },
    /* power */
    power: {
        switch(roomName) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[power] 未找到房间${roomName},请确认房间!`;
            if (!myRoom.memory.switch.StopPower)
                myRoom.memory.switch.StopPower = true;
            else
                myRoom.memory.switch.StopPower = false;
            return `[power] 房间${roomName}的power升级已经设置为${myRoom.memory.switch.StopPower}`;
        },
        save(roomName) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[power] 未找到房间${roomName},请确认房间!`;
            if (!myRoom.memory.switch.SavePower)
                myRoom.memory.switch.SavePower = true;
            else
                myRoom.memory.switch.SavePower = false;
            return `[power] 房间${roomName}的power升级的SavePower选项已经设置为${myRoom.memory.switch.SavePower}`;
        },
        option(roomName, stru) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[power] 未找到房间${roomName},请确认房间!`;
            let switch_;
            switch (stru) {
                case 'storage': {
                    switch_ = 'StopEnhanceStorage';
                    break;
                }
                case 'tower': {
                    switch_ = 'StopEnhanceTower';
                    break;
                }
                case 'lab': {
                    switch_ = 'StopEnhanceLab';
                    break;
                }
                case 'extension': {
                    switch_ = 'StopEnhanceExtension';
                    break;
                }
                case 'spawn': {
                    switch_ = 'StopEnhanceSpawn';
                    break;
                }
                case 'factory': {
                    switch_ = 'StopEnhanceFactory';
                    break;
                }
                case 'powerspawn': {
                    switch_ = 'StopEnhancePowerSpawn';
                    break;
                }
                default: {
                    return `[power] stru数据错误!`;
                }
            }
            if (!myRoom.memory.switch[switch_]) {
                myRoom.memory.switch[switch_] = true;
                return `[power] 房间${roomName}的${switch_}选项调整为true! 将不执行对应的power操作`;
            }
            else {
                delete myRoom.memory.switch[switch_];
                return `[power] 房间${roomName}的${switch_}选项调整为false! 将执行对应的power操作`;
            }
        },
        show(roomName) {
            var myRoom = Game.rooms[roomName];
            if (!myRoom)
                return `[power] 未找到房间${roomName},请确认房间!`;
            let list = [
                'StopEnhanceStorage',
                'StopEnhanceTower',
                'StopEnhanceLab',
                'StopEnhanceExtension',
                'StopEnhanceFactory',
                'StopEnhancePowerSpawn'
            ];
            let result = `[power] 房间${roomName}的power操作开关:\n`;
            for (var i of list) {
                if (myRoom.memory.switch[i])
                    result += Colorful$1(`${i}:true\n`, 'red', true);
                else
                    result += Colorful$1(`${i}:false\n`, 'green', true);
            }
            return result;
        }
    },
    /* 过道行为 */
    cross: {
        // 初始化过道任务
        init(roomName, relateRoom) {
            relateRoom = relateRoom; // ['start'].concat(relateRoom)
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[cross] 不存在房间${roomName}`;
            if (thisRoom.controller.level < 8)
                return `[cross] 房间${roomName}控制器等级不足！`;
            var thisTask = {
                name: "过道采集",
                range: 'Room',
                delayTick: 99999,
                Data: {
                    power: false,
                    deposit: false,
                    relateRooms: relateRoom
                }
            };
            if (thisRoom.AddMission(thisTask))
                return `[cross] 房间${roomName}初始化过道采集任务成功！ 房间：${relateRoom}`;
            else
                return `[cross] 房间${roomName}初始化过道采集任务失败！请检查房间内是否已经存在该任务！`;
        },
        // active power
        power(roomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[cross] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Room']) {
                if (i.name == '过道采集') {
                    i.Data.power = !i.Data.power;
                    if (i.Data.power)
                        return Colorful$1(`[cross] 房间${roomName}过道采集任务的power属性已经更改为${i.Data.power}`, 'blue');
                    else
                        return Colorful$1(`[cross] 房间${roomName}过道采集任务的power属性已经更改为${i.Data.power}`, 'yellow');
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务power属性失败！请检查房间内是否已经存在该任务！`;
        },
        deposit(roomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[cross] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Room']) {
                if (i.name == '过道采集') {
                    i.Data.deposit = !i.Data.deposit;
                    if (i.Data.deposit)
                        return Colorful$1(`[cross] 房间${roomName}过道采集任务的deposit属性已经更改为${i.Data.deposit}`, 'blue');
                    else
                        return Colorful$1(`[cross] 房间${roomName}过道采集任务的deposit属性已经更改为${i.Data.deposit}`, 'yellow');
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务deposit属性失败！请检查房间内是否已经存在该任务！`;
        },
        room(roomName, roomData) {
            roomData = roomData;
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[cross] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Room']) {
                if (i.name == '过道采集') {
                    i.Data.relateRooms = roomData;
                    return `[cross] 房间${roomName}过道采集任务的房间已经更改为${roomData}`;
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务deposit属性失败！请检查房间内是否已经存在该任务！`;
        },
        /* 删除某个房间 */
        remove(roomName, delRoomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[cross] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Room']) {
                if (i.name == '过道采集') {
                    /* 进行删除 */
                    for (var j of i.Data.relateRooms) {
                        if (j == delRoomName) {
                            var list = i.Data.relateRooms;
                            var index = list.indexOf(j);
                            list.splice(index, 1);
                            return `[cross] 房间${roomName}的过道采集清单里已经删除房间${j}！ 现有房间列表为${i.Data.relateRooms}`;
                        }
                    }
                    return `[cross] 房间${roomName}过道采集任务的房间清单未找到房间${delRoomName}`;
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务房间清单失败！请检查房间内是否已经存在该任务！`;
        },
        /* 增加某个房间s */
        add(roomName, addRoomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[cross] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Room']) {
                if (i.name == '过道采集') {
                    /* 进行删除 */
                    if (isInArray(i.Data.relateRooms, addRoomName))
                        return `[cross] 房间${roomName}过道采集任务的房间清单已经存在房间${addRoomName}`;
                    else {
                        i.Data.relateRooms.push(addRoomName);
                        return `[cross] 房间${roomName}过道采集任务的房间清单已经添加房间${addRoomName}！以下为房间清单：${i.Data.relateRooms}`;
                    }
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务房间清单失败！请检查房间内是否已经存在该任务！`;
        },
        /* 删除某个具体power任务 */
        delpower(roomName, disRoom) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[cross] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Creep']) {
                if (i.name == 'power采集' && i.Data.room == disRoom) {
                    if (thisRoom.DeleteMission(i.id))
                        return `[cross] 删除${roomName}-->${disRoom}的power采集任务成功！`;
                    else
                        return `[cross] 删除${roomName}-->${disRoom}的power采集任务失败！`;
                }
            }
            return `[cross] 未找到${roomName}-->${disRoom}的power采集任务`;
        },
        show(roomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[cross] 不存在房间${roomName}`;
            var str = '';
            for (var i of thisRoom.memory.Misson['Room']) {
                if (i.name == '过道采集') {
                    str += `[cross] 房间${roomName}的过道采集任务详情配置如下：\n`;
                    str += `     房间：${i.Data.relateRooms}\n`;
                    str += `     power:${i.Data.power}\n`;
                    str += `     deposit:${i.Data.deposit}\n`;
                    str += `     目前存在如下任务：`;
                    /* 寻找目前存在的过道采集任务 */
                    for (var j of thisRoom.memory.Misson['Creep']) {
                        if (j.name == 'power采集')
                            str += `power采集任务 ${roomName}-->${j.Data.room}  state:${j.Data.state}\n`;
                        if (j.name == 'deposit采集')
                            str += `deposit采集任务 ${roomName}-->${j.Data.room}  state:${j.Data.state}\n`;
                    }
                    return str;
                }
            }
            return `[cross] 房间${roomName}展示过道采集任务失败！请检查房间内是否已经存在该任务！`;
        },
        /* 取消过道采集开关 */
        cancel(roomName) {
            var thisRoom = Game.rooms[roomName];
            if (!thisRoom)
                return `[cross] 不存在房间${roomName}`;
            for (var i of thisRoom.memory.Misson['Room']) {
                if (i.name == '过道采集') {
                    thisRoom.DeleteMission(i.id);
                    return `[cross] 房间${roomName}已经取消过道采集任务！`;
                }
            }
            return `[cross] 房间${roomName}取消过道采集任务失败！请检查房间内是否已经存在该任务！`;
        },
    },
};

// 定义好挂载顺序
const plugins$1 = [
    frameExtension,
    actionExtension,
    staticExtension,
    behaviourExtension,
];
/**
* 依次挂载所有的拓展
*/
var mountConsole = () => plugins$1.forEach(plugin => _.assign(global, plugin));

class linkExtension extends StructureLink {
    ManageMission() {
        if (!this.room.memory.Misson['Structure'])
            this.room.memory.Misson['Structure'] = [];
        var allmyTask = [];
        for (var task of this.room.memory.Misson['Structure']) {
            if (!task.structure)
                continue;
            if (isInArray(task.structure, this.id)) {
                allmyTask.push(task);
            }
        }
        /* 按照优先级排序 */
        if (allmyTask.length <= 0)
            return;
        else if (allmyTask.length >= 1)
            allmyTask.sort(compare('level'));
        /* 处理任务 */
        let thisTask = allmyTask[0];
        if (thisTask.delayTick < 99995)
            thisTask.delayTick--;
        switch (thisTask.name) {
            case "链传送能": {
                this.Handle_Link(thisTask);
                break;
            }
        }
    }
    /* 链传送能 */
    Handle_Link(task) {
        if (this.cooldown && this.cooldown > 0)
            return;
        /* 执行任务 */
        if (!task.Data || !task.Data.disStructure) {
            this.room.DeleteMission(task.id);
        }
        if (this.store.getUsedCapacity('energy') < 700) {
            /* 如果有传送任务但是没有足够能量，只要是centerlink就下达搬运任务 */
            if (this.room.memory.StructureIdData.center_link == this.id) {
                let storage = global.Stru[this.room.name].storage;
                if (!storage)
                    return;
                if (this.room.Check_Carry('manage', storage.pos, this.pos, 'energy')) {
                    var thisTask = this.room.Public_Carry({ 'manage': { num: 1, bind: [] } }, 20, this.room.name, storage.pos.x, storage.pos.y, this.room.name, this.pos.x, this.pos.y, 'energy', this.store.getFreeCapacity());
                    this.room.AddMission(thisTask);
                }
            }
            return;
        }
        var dis = Game.getObjectById(task.Data.disStructure);
        if (!dis || dis.store.getUsedCapacity('energy') >= 790) {
            /* 如果未找到link 或者 对方link满了，就删除任务 */
            this.room.DeleteMission(task.id);
            return;
        }
        /* 传完就删除任务 */
        this.transferEnergy(dis);
        this.room.DeleteMission(task.id);
    }
}

// terminal 扩展
class terminalExtension extends StructureTerminal {
    ManageMission() {
        if (this.room.MissionNum('Creep', '急速冲级') > 0)
            return; // 急速冲级状态下停止terminal功能
        var allmyTask = [];
        for (var task of this.room.memory.Misson['Structure']) {
            if (!task.structure)
                continue;
            if (isInArray(task.structure, this.id)) {
                allmyTask.push(task);
            }
        }
        let thisTask = null;
        /* 按照优先级排序 */
        if (allmyTask.length >= 1)
            allmyTask.sort(compare('level'));
        thisTask = allmyTask[0];
        if (!thisTask || !isInArray(['资源传送'], thisTask.name)) {
            /* terminal默认操作*/
            this.ResourceBalance(); // 资源平衡
            this.ResourceMarket(); // 资源买卖
            if (!thisTask)
                return;
        }
        if (thisTask.delayTick < 99995)
            thisTask.delayTick--;
        switch (thisTask.name) {
            case "资源传送": {
                this.ResourceSend(thisTask);
                break;
            }
            case "资源购买": {
                this.ResourceDeal(thisTask);
                break;
            }
        }
    }
    /**
     * 资源平衡函数,用于平衡房间中资源数量以及资源在terminal和storage中的分布,尤其是能量和原矿
     */
    ResourceBalance() {
        this.RsourceMemory();
        // terminal资源平衡
        if ((Game.time - global.Gtime[this.room.name]) % 7)
            return;
        let storage_ = global.Stru[this.room.name]['storage'];
        if (!storage_) {
            console.log(`找不到global.Stru['${this.room.name}']['storage]!`);
            return;
        }
        for (var i in this.store) {
            if (this.room.RoleMissionNum('manage', '物流运输') >= 1)
                return;
            let num = this.store[i]; // 数量
            if (!this.room.memory.TerminalData[i] || !this.room.memory.TerminalData[i].num) // terminalData里没有该数据
             {
                if (storage_.store.getFreeCapacity() < 40000)
                    continue;
                let thisTask = this.room.Public_Carry({ 'manage': { num: 1, bind: [] } }, 20, this.room.name, this.pos.x, this.pos.y, this.room.name, storage_.pos.x, storage_.pos.y, i, num);
                this.room.AddMission(thisTask);
            }
            else {
                if (num > this.room.memory.TerminalData[i].num) {
                    if (storage_.store.getFreeCapacity() < 40000)
                        continue;
                    let thisTask = this.room.Public_Carry({ 'manage': { num: 1, bind: [] } }, 20, this.room.name, this.pos.x, this.pos.y, this.room.name, storage_.pos.x, storage_.pos.y, i, num - this.room.memory.TerminalData[i].num);
                    this.room.AddMission(thisTask);
                }
            }
        }
        for (var i in this.room.memory.TerminalData) {
            if (this.room.RoleMissionNum('manage', '物流运输') >= 1)
                return;
            if (!this.room.memory.TerminalData[i].fill)
                continue;
            let num = this.store.getUsedCapacity(i);
            if (num < this.room.memory.TerminalData[i].num) {
                if (this.store.getFreeCapacity() < 5000)
                    continue;
                if (i == 'energy') {
                    if (storage_.store.getUsedCapacity('energy') <= 20000)
                        continue;
                }
                else {
                    if (storage_.store.getUsedCapacity(i) <= 0 && storage_.store.getUsedCapacity(i) + num < this.room.memory.TerminalData[i].num)
                        continue;
                }
                let thisTask = this.room.Public_Carry({ 'manage': { num: 1, bind: [] } }, 20, this.room.name, storage_.pos.x, storage_.pos.y, this.room.name, this.pos.x, this.pos.y, i, this.room.memory.TerminalData[i].num - num > 0 ? this.room.memory.TerminalData[i].num - num : 100);
                this.room.AddMission(thisTask);
            }
        }
    }
    /**
     * 资源记忆更新函数
     * */
    RsourceMemory() {
        /* terminal自身资源管理 */
        var terminalData = this.room.memory.TerminalData;
        for (var i in terminalData) {
            /* 数量小于0就删除数据，节省memory */
            if (terminalData[i].num <= 0)
                delete terminalData[i];
        }
    }
    /**
     * 资源买卖函数 只买能量、挂单、卖 (不deal买资源)
     */
    ResourceMarket() {
        if ((Game.time - global.Gtime[this.room.name]) % 27)
            return;
        // 能量自动购买区 [与MarketData无关] storage内能量小于200000时自动购买
        /* 清理过期订单 */
        if (Object.keys(Game.market.orders).length > 80) {
            for (let j in Game.market.orders) {
                let order = Game.market.getOrderById(j);
                if (!order.remainingAmount)
                    Game.market.cancelOrder(j);
            }
        }
        let storage_ = global.Stru[this.room.name]['storage'];
        if (!storage_) {
            console.log(`找不到global.Stru['${this.room.name}']['storage]!`);
            return;
        }
        // 能量购买函数
        if (storage_.store.getUsedCapacity('energy') + this.store.getUsedCapacity('energy') < 250000) {
            let ave = avePrice('energy', 2);
            let highest = highestPrice('energy', 'buy', ave + 6);
            if (!haveOrder(this.room.name, 'energy', 'buy', highest, -0.2)) {
                let result = Game.market.createOrder({
                    type: ORDER_BUY,
                    resourceType: 'energy',
                    price: highest + 0.01,
                    totalAmount: 100000,
                    roomName: this.room.name
                });
                if (result != OK) {
                    console.log("创建能量订单出错,房间", this.room.name);
                }
                console.log(Colorful$1(`房间${this.room.name}创建energy订单,价格:${highest + 0.01};数量:100000`, 'green', true));
            }
            /* 计算平均价格 */
            // let history = Game.market.getHistory('energy')
            // let HistoryLength = history.length
            // let allprice = 0
            // for (var ii=HistoryLength-3;ii<HistoryLength;ii++)
            //     allprice += history[ii].avgPrice
            // let avePrice = allprice/3 + (Memory.marketAdjust['energy']?Memory.marketAdjust['energy']:0.2) // 平均能量价格
            // if (avePrice > 20) avePrice = 20    // 最大不超过20
            // /* 下单 */
            // let thisRoomOrder = Game.market.getAllOrders(order =>
            //     order.type == ORDER_BUY && order.resourceType == 'energy' && order.price >= avePrice - 0.2 && order.roomName == this.room.name)
            // if ((!thisRoomOrder || thisRoomOrder.length <= 0))
            // {
            //     console.log("房间",this.room.name,"订单操作中")
            //     Game.market.createOrder({
            //         type: ORDER_BUY,
            //         resourceType: 'energy',
            //         price: avePrice,
            //         totalAmount: 100000,
            //         roomName: this.room.name   
            //     });
            //     console.log(Colorful(`房间${this.room.name}创建能量订单，价格:${avePrice};数量:100000`,'yellow',true))
            // }
        }
        /* 仓库资源过于饱和就卖掉能量 */
        if (storage_.store.getFreeCapacity() < 50000) {
            /* 如果仓库饱和(小于200k空间)，而且仓库能量超过400K,就卖能量 */
            if (storage_.store.getFreeCapacity() < 200000 && storage_.store.getUsedCapacity('energy') > 350000) {
                if (!this.room.memory.market)
                    this.room.memory.market = {};
                if (!this.room.memory.market['deal'])
                    this.room.memory.market['deal'] = [];
                var bR = true;
                for (var od of this.room.memory.market['deal']) {
                    if (od.rType == 'energy')
                        bR = false;
                }
                if (bR) {
                    /* 下达自动deal的任务 */
                    this.room.memory.market['deal'].push({ rType: 'energy', num: 100000 });
                }
            }
        }
        // 其他类型资源的交易 【考虑到已经有了资源调度模块的存在，这里主要是卖】
        LoopA: for (var t in this.room.memory.market) {
            // deal类型
            if (t == 'deal') {
                if (this.store.getUsedCapacity('energy') < 50000)
                    continue LoopA; // terminal空闲资源过少便不会继续
                LoopB: for (var i of this.room.memory.market['deal']) {
                    if (i.rType != 'energy') {
                        this.room.memory.TerminalData[i.rType] = { num: i.unit ? i.unit : 5000, fill: true };
                    }
                    /* 数量少了就删除 */
                    if (i.num <= 0) {
                        if (i.rType != 'energy')
                            delete this.room.memory.TerminalData[i.rType];
                        var index = this.room.memory.market['deal'].indexOf(i);
                        this.room.memory.market['deal'].splice(index, 1);
                        continue LoopB;
                    }
                    if (this.cooldown)
                        continue LoopA; // 冷却模式下进行不了其他deal了
                    let a = 0, b = 50000;
                    COMMODITIES[i.rType] && COMMODITIES[i.rType].level ? a = 0 : a;
                    let price = 0.05;
                    if (i.price)
                        price = i.price;
                    var orders = Game.market.getAllOrders(order => order.resourceType == i.rType &&
                        price <= order.price && order.type == ORDER_BUY && order.amount >= a && order.amount <= b);
                    if (orders.length <= 0)
                        continue LoopB;
                    /* 按价格从低到高排列 */
                    var newOrderList = orders.sort(compare('price'));
                    // 倒数第二 没有就倒数第一
                    var thisDealOrder = newOrderList.length > 1 ? newOrderList[newOrderList.length - 2] : newOrderList[newOrderList.length - 1];
                    if (!thisDealOrder)
                        continue LoopB;
                    if (storage_.store.getUsedCapacity(i.rType) <= 0 && this.room.RoleMissionNum('manage', '物流运输') <= 0) {
                        if (i.rType != 'energy')
                            delete this.room.memory.TerminalData[i.rType];
                        var index = this.room.memory.market['deal'].indexOf(i);
                        this.room.memory.market['deal'].splice(index, 1);
                        continue LoopB;
                    }
                    if (thisDealOrder.amount >= this.store.getUsedCapacity(i.rType)) {
                        Game.market.deal(thisDealOrder.id, this.store.getUsedCapacity(i.rType), this.room.name);
                        i.num -= this.store.getUsedCapacity(i.rType);
                        break LoopA;
                    }
                    else {
                        Game.market.deal(thisDealOrder.id, thisDealOrder.amount, this.room.name);
                        i.num -= thisDealOrder.amount;
                        break LoopA;
                    }
                }
            }
            // order类型
            else if (t == 'order') {
                LoopC: for (var l of this.room.memory.market['order']) {
                    if (l.rType != 'energy') {
                        this.room.memory.TerminalData[l.rType] = { num: l.unit ? l.unit : 5000, fill: true };
                    }
                    // 查询有无订单
                    if (!l.id) {
                        let myOrder = haveOrder(this.room.name, l.rType, 'sell');
                        if (!myOrder) {
                            console.log(Colorful$1(`[market] 房间${this.room.name}-rType:${l.rType}创建订单!`, 'yellow'));
                            // 没有就创建订单
                            let result = Game.market.createOrder({
                                type: ORDER_SELL,
                                resourceType: l.rType,
                                price: l.price,
                                totalAmount: l.num,
                                roomName: this.room.name
                            });
                            if (result != OK)
                                continue LoopC;
                        }
                        LoopO: for (let o in Game.market.orders) {
                            let order = Game.market.getOrderById(o);
                            if (order.remainingAmount <= 0) {
                                Game.market.cancelOrder(o);
                                continue LoopO;
                            }
                            if (order.roomName == this.room.name && order.resourceType == l.rType && order.type == 'sell')
                                l.id = o;
                        }
                        continue LoopC;
                    }
                    else {
                        let order = Game.market.getOrderById(l.id);
                        if (!order || !order.remainingAmount) // 取消订单信息
                         {
                            if (l.rType != 'energy')
                                delete this.room.memory.TerminalData[l.rType];
                            console.log(Colorful$1(`[market] 房间${this.room.name}订单ID:${l.id},rType:${l.rType}的删除订单!`, 'blue'));
                            var index = this.room.memory.market['order'].indexOf(l);
                            this.room.memory.market['order'].splice(index, 1);
                            continue LoopC;
                        }
                        // 价格
                        let price = order.price;
                        let standprice = l.price;
                        // 价格太低或太高都会改变订单价格
                        if (standprice <= price / 3 || standprice >= price * 3) {
                            Game.market.changeOrderPrice(l.id, l.price);
                            console.log(`[market] 房间${this.room.name}改变订单ID:${l.id},type:${l.rType}的价格为${l.price}`);
                        }
                        // 收到改变价格指令，也会改变订单价格
                        if (l.changePrice) {
                            Game.market.changeOrderPrice(l.id, l.price);
                            console.log(`[market] 房间${this.room.name}改变订单ID:${l.id},type:${l.rType}的价格为${l.price}`);
                            l.changePrice = false;
                        }
                    }
                }
            }
        }
    }
    /**
     * 资源传送
     */
    ResourceSend(task) {
        if (this.cooldown && this.cooldown > 0)
            return;
        if (!task.Data || !task.Data.disRoom) // 任务数据有问题
         {
            this.room.DeleteMission(task.id);
            return;
        }
        if (!task.state)
            task.state = 1; // 1状态下，搜集资源
        if (task.state == 1) {
            if (Game.time % 10)
                return; /* 每10tick监测一次 */
            if (task.Data.num <= 0 || task.Data.num == undefined)
                this.room.DeleteMission(task.id);
            if (this.room.RoleMissionNum('manage', '物流运输') > 0)
                return; // manage爬虫有任务时就不管
            // 路费
            var wastage = Game.market.calcTransactionCost(task.Data.num, this.room.name, task.Data.disRoom);
            /* 如果非能量资源且路费不够，发布资源搬运任务，优先寻找storage */
            var storage_ = global.Stru[this.room.name]['storage'];
            // terminal的剩余资源
            var remain = this.store.getFreeCapacity();
            /* 路费判断 */
            if (wastage > this.store.getUsedCapacity('energy')) {
                /* 只有在能量富裕的情况下才会允许进入下一阶段 */
                if (storage_ && (storage_.store.getUsedCapacity('energy') + this.store.getUsedCapacity('energy') - 5000) > wastage && remain > (wastage - this.store.getUsedCapacity('energy'))) {
                    /* 下布搬运任务 */
                    var thisTask = this.room.Public_Carry({ 'manage': { num: 1, bind: [] } }, 40, this.room.name, storage_.pos.x, storage_.pos.y, this.room.name, this.pos.x, this.pos.y, 'energy', wastage - this.store.getUsedCapacity('energy'));
                    this.room.AddMission(thisTask);
                    return;
                }
                /* 条件不满足就自动删除任务 */
                this.room.DeleteMission(task.id);
                return;
            }
            console.log('资源传送任务监控中: ###########################\n 房间:', this.room.name, '--->', task.Data.disRoom, ' 运送资源：', task.Data.rType);
            console.log('路费:', Colorful$1(`${wastage}`, 'yellow'), 'energy  ', '终端拥有能量:', Colorful$1(`${this.store.getUsedCapacity('energy')}`, 'yellow'), 'energy');
            /* 资源判断 */
            var cargoNum = task.Data.rType == 'energy' ? this.store.getUsedCapacity(task.Data.rType) - wastage : this.store.getUsedCapacity(task.Data.rType);
            console.log('终端拥有资源量:', Colorful$1(`${cargoNum}`, 'blue'), ' 仓库拥有资源量:', storage_.store.getUsedCapacity(task.Data.rType), ' 任务所需资源量:', task.Data.num);
            if (task.Data.num > cargoNum) {
                if (storage_ && (storage_.store.getUsedCapacity(task.Data.rType) + this.store.getUsedCapacity(task.Data.rType)) >= (task.Data.num - 1600) && remain > task.Data.num - cargoNum) {
                    /* 下布搬运任务 */
                    var thisTask = this.room.Public_Carry({ 'manage': { num: 1, bind: [] } }, 40, this.room.name, storage_.pos.x, storage_.pos.y, this.room.name, this.pos.x, this.pos.y, task.Data.rType, task.Data.num - cargoNum);
                    this.room.AddMission(thisTask);
                    return;
                }
                /* 条件不满足就自动删除任务 */
                this.room.DeleteMission(task.id);
                return;
            }
            /* 都满足条件了就进入状态2 */
            task.state = 2;
        }
        else if (task.state == 2) {
            let result = this.send(task.Data.rType, task.Data.num, task.Data.disRoom);
            if (result == -6) /* 能量不够就重新返回状态1 */ {
                console.log(Colorful$1(`房间${this.room.name}发送资源${task.Data.rType}失败!`, 'read', true));
                task.state = 1;
                return;
            }
            else if (result == OK) {
                /* 如果传送成功，就删除任务 */
                this.room.DeleteMission(task.id);
                return;
            }
        }
    }
    /**
     * 资源购买 (deal)
     */
    ResourceDeal(task) {
        if ((Game.time - global.Gtime[this.room.name]) % 10)
            return;
        if (this.cooldown || this.store.getUsedCapacity('energy') < 50000)
            return;
        if (!task.Data) {
            this.room.DeleteMission(task.id);
            return;
        }
        let money = Game.market.credits;
        if (money <= 0 || task.Data.num > 50000) {
            this.room.DeleteMission(task.id);
            return;
        }
        let rType = task.Data.rType;
        let num = task.Data.num;
        var HistoryList = Game.market.getHistory(rType);
        let HistoryLength = HistoryList.length;
        if (HistoryList.length < 3) {
            console.log("marketHistroy错误");
            return;
        } // 以防特殊情况
        var allNum = 0;
        for (var iii = HistoryLength - 3; iii < HistoryLength; iii++) {
            allNum += HistoryList[iii].avgPrice;
        }
        var avePrice = allNum / 3; // 平均价格 [近3天]
        // 获取该资源的平均价格
        var maxPrice = avePrice + (task.Data.range ? task.Data.range : 50); // 范围
        /* 在市场上寻找 */
        var orders = Game.market.getAllOrders(order => order.resourceType == rType &&
            order.type == ORDER_SELL && order.price <= maxPrice);
        if (orders.length <= 0)
            return;
        /* 寻找价格最低的 */
        var newOrderList = orders.sort(compare('price'));
        for (var ii of newOrderList) {
            if (ii.price > maxPrice)
                return;
            if (ii.amount >= num) {
                if (Game.market.deal(ii.id, num, this.room.name) == OK) {
                    this.room.DeleteMission(task.id);
                    return;
                }
                else
                    return;
            }
            else {
                if (Game.market.deal(ii.id, ii.amount, this.room.name) == OK)
                    task.Data.num -= ii.amount;
                return;
            }
        }
    }
}

// 定义好挂载顺序
var mountStructure = () => {
    assignPrototype(StructureLink, linkExtension);
    assignPrototype(StructureTerminal, terminalExtension);
};

// import { RequestShard } from "@/shard/base"
/* 本地寻路移动 */
class PowerCreepMoveExtension extends PowerCreep {
    // 位置标准化
    standardizePos(pos) {
        return `${pos.roomName}/${pos.x}/${pos.y}/${Game.shard.name}`;
    }
    // 寻找不允许对穿的爬虫的位置
    getStandedPos() {
        var standedCreep = this.room.find(FIND_MY_CREEPS, { filter: (creep) => {
                return (creep.memory.standed == true || (creep.memory.crossLevel && this.memory.crossLevel && creep.memory.crossLevel > this.memory.crossLevel));
            } });
        if (standedCreep.length > 0) {
            var posList = [];
            for (var i of standedCreep) {
                posList.push(i.pos);
            }
            return posList;
        }
        return [];
    }
    // 通用寻路
    findPath(target, range) {
        /* 全局路线存储 */
        if (!global.routeCache)
            global.routeCache = {};
        if (!this.memory.moveData)
            this.memory.moveData = {};
        this.memory.moveData.index = 0;
        /* 查找全局中是否已经有预定路线，如果有了就直接返回路线 */
        const routeKey = `${this.standardizePos(this.pos)} ${this.standardizePos(target)}`;
        var route = global.routeCache[routeKey];
        if (route && this.room.name != target.roomName) {
            return route;
        }
        /* 路线查找 */
        const result = PathFinder.search(this.pos, { pos: target, range: range }, {
            plainCost: 2,
            swampCost: 10,
            maxOps: 8000,
            roomCallback: roomName => {
                // 在全局绕过房间列表的房间 false
                if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName))
                    return false;
                // 在爬虫记忆绕过房间列表的房间 false
                if (this.memory.bypassRooms && this.memory.bypassRooms.includes(roomName))
                    return false;
                const room = Game.rooms[roomName];
                // 没有视野的房间只观察地形
                if (!room)
                    return;
                // 有视野的房间
                let costs = new PathFinder.CostMatrix;
                // 将道路的cost设置为1，无法行走的建筑设置为255
                room.find(FIND_STRUCTURES).forEach(struct => {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        costs.set(struct.pos.x, struct.pos.y, 1);
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER &&
                        (struct.structureType !== STRUCTURE_RAMPART || !struct.my))
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                });
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(cons => {
                    if (cons.structureType != 'road' && cons.structureType != 'rampart' && cons.structureType != 'container')
                        costs.set(cons.pos.x, cons.pos.y, 255);
                });
                /* 防止撞到其他虫子造成堵虫 */
                room.find(FIND_HOSTILE_CREEPS).forEach(creep => {
                    costs.set(creep.pos.x, creep.pos.y, 255);
                });
                room.find(FIND_MY_CREEPS).forEach(creep => {
                    if ((creep.memory.crossLevel && creep.memory.crossLevel > this.memory.crossLevel) || creep.memory.standed)
                        costs.set(creep.pos.x, creep.pos.y, 255);
                    else
                        costs.set(creep.pos.x, creep.pos.y, 3);
                });
                return costs;
            }
        });
        // 寻路异常返回null
        if (result.path.length <= 0)
            return null;
        // 寻路结果压缩
        route = this.serializeFarPath(result.path);
        if (!result.incomplete)
            global.routeCache[routeKey] = route;
        return route;
    }
    // 使用寻路结果移动
    goByPath() {
        if (!this.memory.moveData)
            return ERR_NO_PATH;
        const index = this.memory.moveData.index;
        // 移动索引超过数组上限代表到达目的地
        if (index >= this.memory.moveData.path.length) {
            delete this.memory.moveData.path;
            return OK;
        }
        // 获取方向，进行移动
        const direction = Number(this.memory.moveData.path[index]);
        const goResult = this.go(direction);
        // 移动成功，更新下次移动索引
        if (goResult == OK)
            this.memory.moveData.index++;
        return goResult;
    }
    // 通用移动 (配合findPath 和 goByPath)
    goTo(target, range = 1) {
        //  var a = Game.cpu.getUsed()
        if (this.memory.moveData == undefined)
            this.memory.moveData = {};
        // 确认目标没有变化，如果变化了就重新规划路线
        const targetPosTag = this.standardizePos(target);
        if (targetPosTag !== this.memory.moveData.targetPos) {
            this.memory.moveData.targetPos = targetPosTag;
            this.memory.moveData.path = this.findPath(target, range);
        }
        // 确认缓存有没有被清除
        if (!this.memory.moveData.path) {
            this.memory.moveData.path = this.findPath(target, range);
        }
        // 还为空的话就是没有找到路径
        if (!this.memory.moveData.path) {
            delete this.memory.moveData.path;
            return OK;
        }
        // 使用缓存进行移动
        const goResult = this.goByPath();
        // 如果发生撞停或者参数异常，说明缓存可能存在问题，移除缓存
        if (goResult === ERR_INVALID_TARGET) {
            delete this.memory.moveData;
        }
        else if (goResult != OK && goResult != ERR_TIRED) {
            this.say(`异常码:${goResult}`);
        }
        // var b = Game.cpu.getUsed()
        // this.say(`${b-a}`)
        return goResult;
    }
    // 请求对穿 按照对穿等级划分 等级高的可以任意对穿等级低的，等级低的无法请求等级高的对穿，等级相等则不影响
    requestCross(direction) {
        if (!this.memory.crossLevel)
            this.memory.crossLevel = 10; // 10为默认对穿等级
        // 获取目标方向一格的位置
        const fontPos = this.pos.directionToPos(direction);
        // 在出口、边界
        if (!fontPos)
            return ERR_NOT_FOUND;
        const fontCreep = (fontPos.lookFor(LOOK_CREEPS)[0] || fontPos.lookFor(LOOK_POWER_CREEPS)[0]);
        if (!fontCreep)
            return ERR_NOT_FOUND;
        if (fontCreep.owner.username != this.owner.username)
            return;
        this.say("👉");
        if (fontCreep.manageCross(getOppositeDirection(direction), this.memory.crossLevel))
            this.move(direction);
        return OK;
    }
    // 处理对穿
    manageCross(direction, crossLevel) {
        if (!this.memory.crossLevel)
            this.memory.crossLevel = 10;
        if (!this.memory)
            return true;
        if (this.memory.standed || this.memory.crossLevel > crossLevel) {
            if (!(Game.time % 5))
                this.say('👊');
            return false;
        }
        // 同意对穿
        this.say('👌');
        this.move(direction);
        return true;
    }
    // 单位移动 (goByPath中的移动基本函数)
    go(direction) {
        const moveResult = this.move(direction);
        if (moveResult != OK)
            return moveResult;
        // 如果ok的话，有可能撞上东西了或者一切正常
        const currentPos = `${this.pos.x}/${this.pos.y}`;
        if (this.memory.prePos && currentPos == this.memory.prePos) {
            // 这个时候确定在原点驻留了
            const crossResult = this.memory.disableCross ? ERR_BUSY : this.requestCross(direction);
            if (crossResult != OK) {
                delete this.memory.moveData;
                return ERR_INVALID_TARGET;
            }
        }
        this.memory.prePos = currentPos;
        return OK;
    }
    /* 压缩路径 */
    serializeFarPath(positions) {
        if (positions.length == 0)
            return '';
        // 确保路径里第一个位置是自己当前的位置
        if (!positions[0].isEqualTo(this.pos))
            positions.splice(0, 0, this.pos);
        return positions.map((pos, index) => {
            // 最后一个位置就不用再移动
            if (index >= positions.length - 1)
                return null;
            // 由于房间边缘地块会有重叠，所以这里筛除掉重叠的步骤
            if (pos.roomName != positions[index + 1].roomName)
                return null;
            // 获取到下个位置的方向
            return pos.getDirectionTo(positions[index + 1]);
        }).join('');
    }
}

class PowerCreepMissonBase extends PowerCreep {
    // pc处理任务专用函数
    ManageMisson() {
        /* 获取名字 */
        var name = this.name;
        var info = name.split('/');
        /* pc姓名 如： E41S45/home/shard3/1 */
        if (info.length != 3) {
            this.say("名字有问题!");
            return;
        }
        if (!this.memory.belong)
            this.memory.belong = info[0]; // 所属房间
        if (!this.memory.role)
            this.memory.role = info[1]; // 角色
        if (!this.memory.shard)
            this.memory.shard = info[2]; // 所属shard
        if (!Game.rooms[this.memory.belong])
            return;
        var thisSpawn = global.Stru[this.memory.belong]['powerspawn'];
        if (!thisSpawn)
            return;
        if (!this.memory.spawn) {
            this.memory.spawn = thisSpawn.id;
        }
        // 房间没开power去开power
        if (!Game.rooms[this.memory.belong].controller.isPowerEnabled) {
            /* 没有允许Power就自动激活power开关 */
            if (!this.pos.isNearTo(Game.rooms[this.memory.belong].controller))
                this.goTo(Game.rooms[this.memory.belong].controller.pos, 1);
            else
                this.enableRoom(Game.rooms[this.memory.belong].controller);
            return;
        }
        // 快没生命了去renew
        if (this.room.name == this.memory.belong && this.memory.shard == Game.shard.name) {
            if (this.ticksToLive < 1000) {
                if (!this.pos.isNearTo(thisSpawn)) {
                    this.goTo(thisSpawn.pos, 1);
                }
                else
                    this.renew(thisSpawn);
                return;
            }
        }
        if (!this.memory.MissionData)
            this.memory.MissionData = {};
        if (!Game.rooms[this.memory.belong].memory.Misson['PowerCreep'])
            Game.rooms[this.memory.belong].memory.Misson['PowerCreep'] = [];
        if (Object.keys(this.memory.MissionData).length <= 0) {
            /* 领取任务 */
            var taskList = Game.rooms[this.memory.belong].memory.Misson['PowerCreep'];
            var thisTaskList = [];
            for (var Stask of taskList) {
                if (Stask.CreepBind && isInArray(Object.keys(Stask.CreepBind), this.memory.role))
                    thisTaskList.push(Stask);
            }
            /* 根据优先等级排列，领取最优先的任务 */
            thisTaskList.sort(compare('level'));
            /* 还没有绑定的任务，就等待接取任务 */
            LoopBind: for (var t of thisTaskList) {
                if (t.CreepBind && t.CreepBind[this.memory.role] && t.CreepBind[this.memory.role].bind.length < t.CreepBind[this.memory.role].num) {
                    /* 绑定任务了就输入任务数据 */
                    t.processing = true; // 领取任务后，任务开始计时
                    t.CreepBind[this.memory.role].bind.push(this.name);
                    this.memory.MissionData.id = t.id; // 任务id
                    this.memory.MissionData.name = t.name; // 任务名
                    this.memory.MissionData.delay = 150; // 爬虫处理任务的超时时间
                    this.memory.MissionData.Data = t.Data ? t.Data : {}; // 任务数据传输
                    break LoopBind;
                }
            }
            if (Object.keys(this.memory.MissionData).length <= 0) {
                /* 没有任务就生产ops */
                if (this.powers[PWR_GENERATE_OPS] && !this.powers[PWR_GENERATE_OPS].cooldown) {
                    this.usePower(PWR_GENERATE_OPS);
                }
                // 如果ops过多，就转移ops
                if (this.store.getUsedCapacity('ops') == this.store.getCapacity()) {
                    var storage_ = global.Stru[this.memory.belong]['storage'];
                    if (!storage_)
                        return;
                    if (this.transfer(storage_, 'ops', Math.ceil(this.store.getUsedCapacity('ops') / 4)) == ERR_NOT_IN_RANGE)
                        this.goTo(storage_.pos, 1);
                }
            }
            return;
        }
        else {
            /* 处理任务 */
            this.memory.MissionData.delay--; // 爬虫内置Tick计时
            if (this.memory.MissionData.delay <= 0) {
                this.memory.MissionData = {};
                return;
            }
            switch (this.memory.MissionData.name) {
                case "仓库扩容": {
                    this.handle_pwr_storage();
                    break;
                }
                case '塔防增强': {
                    this.handle_pwr_tower();
                    break;
                }
                case '合成加速': {
                    this.handle_pwr_lab();
                    break;
                }
                case '扩展填充': {
                    this.handle_pwr_extension();
                    break;
                }
                case '虫卵强化': {
                    this.handle_pwr_spawn();
                    break;
                }
                case '工厂强化': {
                    this.handle_pwr_factory();
                    break;
                }
                case 'power强化': {
                    this.handle_pwr_powerspawn();
                    break;
                }
            }
        }
    }
    // queen类型pc执行任务前执行的准备
    OpsPrepare() {
        var storage_ = global.Stru[this.memory.belong]['storage'];
        if (!storage_)
            return false;
        // 先去除杂质
        for (let i in this.store) {
            if (i != 'ops') {
                this.transfer_(storage_, i);
                return;
            }
        }
        let num = this.store.getUsedCapacity('ops');
        if (num < 200 || num < Math.ceil(this.store.getCapacity() / 4)) {
            this.usePower(PWR_GENERATE_OPS);
            // 过少就去提取ops资源
            if (storage_.store.getUsedCapacity('ops') < 2500) {
                // 资源调度
                let room_ = Game.rooms[this.memory.belong];
                if (room_.MissionNum('Structure', '资源购买') <= 0)
                    if (DispatchNum(room_.name) < 2 && !checkSend(room_.name, 'ops') && !checkDispatch(room_.name, 'ops')) // 已经存在其它房间的传送信息的情况
                     {
                        console.log(Colorful$1(`[资源调度] 房间${this.name}没有足够的资源[${'ops'}],将执行资源调度!`, 'yellow'));
                        let dispatchTask = {
                            sourceRoom: room_.name,
                            rType: 'ops',
                            num: 10000,
                            delayTick: 200,
                            conditionTick: 35,
                            buy: true,
                            mtype: 'deal'
                        };
                        Memory.ResourceDispatchData.push(dispatchTask);
                    }
            }
            if (storage_.store.getUsedCapacity('ops') > 0)
                if (this.withdraw(storage_, 'ops', Math.ceil(this.store.getCapacity() / 2)) == ERR_NOT_IN_RANGE) {
                    this.goTo(storage_.pos, 1);
                }
            return false;
        }
        else
            return true;
    }
}

class PowerCreepFunctionExtension extends PowerCreep {
    workstate(rType = RESOURCE_ENERGY) {
        if (!this.memory.working)
            this.memory.working = false;
        if (this.memory.working && this.store[rType] == 0) {
            this.memory.working = false;
        }
        if (!this.memory.working && this.store.getFreeCapacity() == 0) {
            this.memory.working = true;
        }
    }
    transfer_(distination, rType = RESOURCE_ENERGY) {
        if (this.transfer(distination, rType) == ERR_NOT_IN_RANGE) {
            this.goTo(distination.pos, 1);
        }
        this.memory.standed = false;
    }
    withdraw_(distination, rType = RESOURCE_ENERGY) {
        if (this.withdraw(distination, rType) == ERR_NOT_IN_RANGE) {
            this.goTo(distination.pos, 1);
        }
        this.memory.standed = false;
    }
}

class PowerCreepMissonAction extends PowerCreep {
    // 操作仓库
    handle_pwr_storage() {
        var storage_ = global.Stru[this.memory.belong]['storage'];
        if (!storage_)
            return;
        if (isOPWR(storage_)) {
            Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
            this.memory.MissionData = {};
        }
        if (!this.OpsPrepare())
            return;
        if (!this.pos.isNearTo(storage_)) {
            this.goTo(storage_.pos, 1);
            return;
        }
        else
            this.usePower(PWR_OPERATE_STORAGE, storage_);
    }
    // 操作tower
    handle_pwr_tower() {
        if (this.powers[PWR_OPERATE_TOWER] && this.powers[PWR_OPERATE_TOWER].cooldown) {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id)) {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                this.memory.MissionData = {};
            }
            else
                this.memory.MissionData = {};
            return;
        }
        if (!this.OpsPrepare())
            return;
        for (var id of this.memory.MissionData.data.tower) {
            var tower_ = Game.getObjectById(id);
            if (!isOPWR(tower_)) {
                if (!this.pos.isNearTo(tower_)) {
                    this.goTo(tower_.pos, 1);
                }
                else {
                    this.usePower(PWR_OPERATE_TOWER, tower_);
                }
                return;
            }
        }
    }
    // 操作lab
    handle_pwr_lab() {
        if (this.powers[PWR_OPERATE_LAB] && this.powers[PWR_OPERATE_LAB].cooldown) {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id)) {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                this.memory.MissionData = {};
            }
            else
                this.memory.MissionData = {};
            return;
        }
        if (!this.OpsPrepare())
            return;
        for (var id of this.memory.MissionData.data.lab) {
            var lab_ = Game.getObjectById(id);
            if (!isOPWR(lab_)) {
                if (!this.pos.isNearTo(lab_)) {
                    this.goTo(lab_.pos, 1);
                }
                else {
                    this.usePower(PWR_OPERATE_LAB, lab_);
                }
                return;
            }
        }
    }
    // 操作拓展
    handle_pwr_extension() {
        var storage_ = global.Stru[this.memory.belong]['storage'];
        if (!storage_)
            return;
        if (this.powers[PWR_OPERATE_EXTENSION] && this.powers[PWR_OPERATE_EXTENSION].cooldown) {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id)) {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                this.memory.MissionData = {};
            }
            else
                this.memory.MissionData = {};
            return;
        }
        if (!this.OpsPrepare())
            return;
        if (!this.pos.inRangeTo(storage_, 3)) {
            this.goTo(storage_.pos, 3);
            return;
        }
        else
            this.usePower(PWR_OPERATE_EXTENSION, storage_);
    }
    /* 操作孵化 */
    handle_pwr_spawn() {
        if (this.powers[PWR_OPERATE_SPAWN] && this.powers[PWR_OPERATE_SPAWN].cooldown) {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id)) {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                this.memory.MissionData = {};
            }
            else
                this.memory.MissionData = {};
            return;
        }
        var spawningSpawn = this.pos.findClosestByRange(FIND_STRUCTURES, { filter: (stru) => {
                return stru.structureType == 'spawn';
            } });
        if (!this.OpsPrepare())
            return;
        if (!this.pos.inRangeTo(spawningSpawn, 3)) {
            this.goTo(spawningSpawn.pos, 3);
            return;
        }
        else
            this.usePower(PWR_OPERATE_SPAWN, spawningSpawn);
    }
    /* 操作工厂 */
    handle_pwr_factory() {
        var factory_ = global.Stru[this.memory.belong]['factory'];
        if (!factory_)
            return;
        if (this.powers[PWR_OPERATE_FACTORY] && this.powers[PWR_OPERATE_FACTORY].cooldown) {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id)) {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                this.memory.MissionData = {};
            }
            else
                this.memory.MissionData = {};
            return;
        }
        if (!this.OpsPrepare())
            return;
        if (!this.pos.inRangeTo(factory_, 3)) {
            this.goTo(factory_.pos, 3);
            return;
        }
        else
            this.usePower(PWR_OPERATE_FACTORY, factory_);
    }
    /* 操作powerspawn */
    handle_pwr_powerspawn() {
        var powerspawn_ = global.Stru[this.memory.belong]['powerspawn'];
        if (!powerspawn_)
            return;
        if (this.powers[PWR_OPERATE_POWER] && this.powers[PWR_OPERATE_POWER].cooldown) {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id)) {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id);
                this.memory.MissionData = {};
            }
            else
                this.memory.MissionData = {};
            return;
        }
        if (!this.OpsPrepare())
            return;
        if (!this.pos.inRangeTo(powerspawn_, 3)) {
            this.goTo(powerspawn_.pos, 3);
            return;
        }
        else
            this.usePower(PWR_OPERATE_POWER, powerspawn_);
    }
}

// 定义好挂载顺序
const plugins = [
    PowerCreepMoveExtension,
    PowerCreepMissonBase,
    PowerCreepFunctionExtension,
    PowerCreepMissonAction,
];
/**
* 依次挂载所有的拓展
*/
var mountPowerCreep = () => plugins.forEach(plugin => assignPrototype(PowerCreep, plugin));

function Mount () {
    if (!global.Mounted) {
        mountConsole();
        mountPosition();
        mountRoom();
        mountStructure();
        mountCreep();
        mountPowerCreep();
        global.Mounted = true;
    }
}

/* 资源调度模块 */
// 主调度函数
function ResourceDispatch(thisRoom) {
    if ((Game.time - global.Gtime[thisRoom.name]) % 15)
        return;
    // 处理订单前检查
    let storage_ = global.Stru[thisRoom.name]['storage'];
    let terminal_ = global.Stru[thisRoom.name]['terminal'];
    if (thisRoom.controller.level < 6 || !storage_ || !terminal_)
        return;
    if (thisRoom.MissionNum('Structure', '资源传送') >= 1)
        return; // 如果房间有资源传送任务，则不执行
    // ResourceLimit更新
    ResourceLimitUpdate(thisRoom);
    /* 对资源调度进行操作 */
    for (let i of Memory.ResourceDispatchData) {
        // 执行资源调度
        if (i.sourceRoom == thisRoom.name) {
            // 执行买操作
            if (i.conditionTick <= 0 && i.buy) {
                if (i.mtype == 'order') {
                    /**
                     *       1.获取近两天的平均价格
                     *       2.拉取平均价格+10以内价格最高的订单
                     *       3.发布订单的价格比最高的订单的价格多0.01
                    */
                    console.log(Colorful$1(`[资源调度] 房间${thisRoom.name}需求资源[${i.rType}]无法调度,将进行购买! 购买方式为${i.mtype},购买数量${i.num}`, 'yellow'));
                    let ave = avePrice(i.rType, 2);
                    if (!haveOrder(thisRoom.name, i.rType, 'buy', ave)) {
                        let highest = highestPrice(i.rType, 'buy', ave + 10);
                        let result = Game.market.createOrder({
                            type: ORDER_BUY,
                            resourceType: i.rType,
                            price: highest + 0.01,
                            totalAmount: i.num,
                            roomName: thisRoom.name
                        });
                        if (result != OK) {
                            console.log("[资源调度]创建能量订单出错,房间", thisRoom.name);
                            continue;
                        }
                        console.log(Colorful$1(`房间${thisRoom.name}创建${i.rType}订单,价格:${highest + 0.01};数量:${i.num}`, 'green', true));
                        i.delayTick = 0;
                    }
                    continue;
                }
                else if (i.mtype == 'deal') {
                    if (thisRoom.Check_Buy(i.rType) || thisRoom.MissionNum('Structure', '资源购买') >= 2)
                        continue;
                    // 在一定范围内寻找最便宜的订单deal 例如平均价格20 范围 10 最高价格31 便只能接受30以下的价格 （根据资源不同选择不同参数）
                    console.log(Colorful$1(`[资源调度] 房间${thisRoom.name}需求资源[${i.rType}]无法调度,将进行购买! 购买方式为${i.mtype},购买数量:${i.num}`, 'yellow'));
                    // 能量 ops
                    if (isInArray(['ops', 'energy'], i.rType)) {
                        let task = thisRoom.Public_Buy(i.rType, i.num, 5, 10);
                        if (task) {
                            thisRoom.AddMission(task);
                            i.delayTick = 0;
                        }
                        continue;
                    }
                    // 原矿 中间化合物
                    else if (isInArray(['X', 'L', 'H', 'O', 'Z', 'K', 'U', 'G', 'OH', 'ZK', 'UL'], i.rType)) {
                        let task = thisRoom.Public_Buy(i.rType, i.num, 10, 30);
                        if (task) {
                            thisRoom.AddMission(task);
                            i.delayTick = 0;
                        }
                        continue;
                    }
                    // t3
                    else if (isInArray(t3, i.rType)) {
                        let task = thisRoom.Public_Buy(i.rType, i.num, 50, 150);
                        if (task) {
                            thisRoom.AddMission(task);
                            i.delayTick = 0;
                        }
                        continue;
                    }
                    // power
                    else if (i.rType == 'power') {
                        let task = thisRoom.Public_Buy(i.rType, i.num, 20, 70);
                        if (task) {
                            thisRoom.AddMission(task);
                            i.delayTick = 0;
                        }
                        continue;
                    }
                    // t1 t2
                    else if (isInArray(t2, i.rType) || isInArray(t1, i.rType)) {
                        let task = thisRoom.Public_Buy(i.rType, i.num, 20, 65);
                        if (task) {
                            thisRoom.AddMission(task);
                            i.delayTick = 0;
                        }
                        continue;
                    }
                    // 其他商品类资源 bar类资源
                    else {
                        let task = thisRoom.Public_Buy(i.rType, i.num, 50, 200);
                        if (task) {
                            thisRoom.AddMission(task);
                            i.delayTick = 0;
                        }
                        continue;
                    }
                }
                else {
                    // 未定义i.mtype 便按照默认的执行
                    if (i.rType == 'energy')
                        i.mtype = 'order';
                    else
                        i.mtype = 'deal';
                    continue;
                }
            }
        }
        else {
            if (i.dealRoom)
                continue;
            // 接单
            if (storage_.store.getUsedCapacity(i.rType))
                var limitNum = global.ResourceLimit[thisRoom.name][i.rType] ? global.ResourceLimit[thisRoom.name][i.rType] : 0;
            if (storage_.store.getUsedCapacity(i.rType) <= 0)
                continue; // 没有就删除
            // storage里资源大于等于调度所需资源
            if ((storage_.store.getUsedCapacity(i.rType) - limitNum) >= i.num) {
                var SendNum = i.num > 50000 ? 50000 : i.num;
                let task = thisRoom.Public_Send(i.sourceRoom, i.rType, SendNum);
                if (task && thisRoom.AddMission(task)) {
                    if (i.num <= 50000)
                        i.dealRoom = thisRoom.name; // 如果调度数量大于50k 则只减少num数量
                    console.log(`房间${thisRoom.name}接取房间${i.sourceRoom}的资源调度申请,资源:${i.rType},数量:${SendNum}`);
                    i.num -= SendNum;
                    return;
                }
            }
            // sotrage里资源小于调度所需资源
            if ((storage_.store.getUsedCapacity(i.rType) - limitNum) > 0 && storage_.store.getUsedCapacity(i.rType) - limitNum < i.num) {
                let SendNum = storage_.store.getUsedCapacity(i.rType) - limitNum;
                let task = thisRoom.Public_Send(i.sourceRoom, i.rType, SendNum);
                if (task && thisRoom.AddMission(task)) {
                    console.log(`房间${thisRoom.name}接取房间${i.sourceRoom}的资源调度申请,资源:${i.rType},数量:${SendNum}`);
                    i.num -= SendNum;
                    return;
                }
            }
        }
    }
}
// 调度信息超时管理器
function ResourceDispatchTick() {
    for (let i of Memory.ResourceDispatchData) {
        // 超时将删除调度信息
        if (!i.delayTick || i.delayTick <= 0 || i.num <= 0 || !i.rType) {
            console.log(`[资源调度]房间${i.sourceRoom}的[${i.rType}]资源调度删除!原因:调度任务已部署|超时|无效调度`);
            let index = Memory.ResourceDispatchData.indexOf(i);
            Memory.ResourceDispatchData.splice(index, 1);
        }
        if (i.delayTick > 0)
            i.delayTick--;
        if (i.conditionTick > 0) {
            if (i.dealRoom) // 有deal房间的时候， conditionTick衰减减慢
             {
                if (Game.time % 5 == 0)
                    i.conditionTick--;
            }
            else {
                i.conditionTick--;
            }
        }
    }
}
// 调度信息更新器  ResourceLimit 建议放global里
function ResourceLimitUpdate(thisRoom) {
    global.ResourceLimit[thisRoom.name] = {}; // 初始化
    global.ResourceLimit[thisRoom.name]['energy'] = 350000;
    for (var i of t3)
        global.ResourceLimit[thisRoom.name][i] = 8000; // 所有t3保存8000基础量，以备应急
    for (var b of ['X', 'L', 'Z', 'U', 'K', 'O', 'H'])
        global.ResourceLimit[thisRoom.name][b] = 15000; // 所有基础资源保存15000的基础量
    // 监测boost
    if (Object.keys(thisRoom.memory.RoomLabBind).length > 0) {
        for (var l in thisRoom.memory.RoomLabBind) {
            let lab = Game.getObjectById(l);
            if (!lab)
                continue;
            if (!global.ResourceLimit[thisRoom.name][thisRoom.memory.RoomLabBind[l].rType])
                global.ResourceLimit[thisRoom.name][thisRoom.memory.RoomLabBind[l].rType] = 8000;
            else {
                global.ResourceLimit[thisRoom.name][thisRoom.memory.RoomLabBind[l].rType] = global.ResourceLimit[thisRoom.name][thisRoom.memory.RoomLabBind[l].rType] > 8000 ? global.ResourceLimit[thisRoom.name][thisRoom.memory.RoomLabBind[l].rType] : 8000;
            }
        }
    }
    // 监测lab合成
    if (thisRoom.MissionNum('Room', '资源合成') > 0) {
        for (var m of thisRoom.memory.Misson['Room'])
            if (m.name == '资源合成') {
                if (!global.ResourceLimit[thisRoom.name][m.Data.raw1])
                    global.ResourceLimit[thisRoom.name][m.Data.raw1] = m.Data.num;
                else {
                    global.ResourceLimit[thisRoom.name][m.Data.raw1] = global.ResourceLimit[thisRoom.name][m.Data.raw1] > m.Data.num ? global.ResourceLimit[thisRoom.name][m.Data.raw1] : m.Data.num;
                }
                if (!global.ResourceLimit[thisRoom.name][m.Data.raw2])
                    global.ResourceLimit[thisRoom.name][m.Data.raw2] = m.Data.num;
                else {
                    global.ResourceLimit[thisRoom.name][m.Data.raw2] = global.ResourceLimit[thisRoom.name][m.Data.raw2] > m.Data.num ? global.ResourceLimit[thisRoom.name][m.Data.raw2] : m.Data.num;
                }
            }
    }
    // 监测合成规划
    if (Object.keys(thisRoom.memory.ComDispatchData).length > 0) {
        for (var g in thisRoom.memory.ComDispatchData) {
            if (!global.ResourceLimit[thisRoom.name][g])
                global.ResourceLimit[thisRoom.name][g] = thisRoom.memory.ComDispatchData[g].dispatch_num;
            else {
                global.ResourceLimit[thisRoom.name][g] = global.ResourceLimit[thisRoom.name][g] > thisRoom.memory.ComDispatchData[g].dispatch_num ? global.ResourceLimit[thisRoom.name][g] : thisRoom.memory.ComDispatchData[g].dispatch_num;
            }
        }
    }
    // 监测资源卖出
    for (var mtype in thisRoom.memory.market)
        for (var obj of thisRoom.memory.market[mtype]) {
            if (!global.ResourceLimit[thisRoom.name][obj.rType])
                global.ResourceLimit[thisRoom.name][obj.rType] = obj.num;
            else {
                global.ResourceLimit[thisRoom.name][obj.rType] = global.ResourceLimit[thisRoom.name][obj.rType] > obj.num ? global.ResourceLimit[thisRoom.name][obj.rType] : obj.num;
            }
        }
    // 监测工厂相关
}

/* [通用]房间运行主程序 */
var RoomWork = () => {
    if (!Memory.RoomControlData)
        Memory.RoomControlData = {};
    for (var roomName in Memory.RoomControlData) {
        let thisRoom = Game.rooms[roomName];
        if (!thisRoom)
            continue;
        /* 房间核心 */
        thisRoom.RoomInit(); // 房间数据初始化
        thisRoom.RoomEcosphere(); // 房间状态、布局
        thisRoom.SpawnMain(); // 常驻爬虫的孵化管理 [不涉及任务相关爬虫的孵化]
        /* 房间运维 */
        thisRoom.MissionManager(); // 任务管理器
        thisRoom.SpawnExecution(); // 孵化爬虫
        thisRoom.TowerWork(); // 防御塔工作
        thisRoom.StructureMission(); // terminal link factory 工作
        ResourceDispatch(thisRoom); // 资源调度
        thisRoom.LevelMessageUpdate(); // 房间等级Memory信息更新
    }
};

/* [通用]爬虫运行主程序 */
var CreepWork = () => {
    /* powercreep */
    for (var pc in Game.powerCreeps) {
        if (Game.powerCreeps[pc].ticksToLive) {
            Game.powerCreeps[pc].ManageMisson();
        }
    }
    /* creep */
    let adaption = true; // 每tick执行一次adaption检查
    for (var c in Game.creeps) {
        let thisCreep = Game.creeps[c];
        if (!thisCreep)
            continue;
        /* 跨shard找回记忆 */
        if (!thisCreep.memory.role) {
            var InshardMemory = JSON.parse(InterShardMemory.getLocal()) || {};
            if (InshardMemory.creep && InshardMemory.creep[c]) {
                Game.creeps[c].memory = InshardMemory.creep[c].MemoryData;
            }
            continue;
        }
        if (!RoleData[thisCreep.memory.role])
            continue;
        // 自适应体型生产的爬虫执行恢复体型的相关逻辑
        if (adaption && thisCreep.memory.adaption && thisCreep.store.getUsedCapacity() == 0) {
            let room = Game.rooms[thisCreep.memory.belong];
            if (!room)
                continue;
            let bodyData = RoleLevelData[thisCreep.memory.role][room.controller.level].bodypart;
            let allSpawnenergy = CalculateEnergy(GenerateAbility(bodyData[0], bodyData[1], bodyData[2], bodyData[3], bodyData[4], bodyData[5], bodyData[6], bodyData[7]));
            if (bodyData && room.energyAvailable >= allSpawnenergy && room.memory.SpawnList && room.memory.SpawnList.length <= 0) {
                thisCreep.suicide();
                adaption = false;
            }
            /* adaption爬虫执行自S */
        }
        /* 非任务类型爬虫 */
        Game.cpu.getUsed();
        if (RoleData[thisCreep.memory.role].fun) {
            RoleData[thisCreep.memory.role].fun(thisCreep);
        }
        /* 任务类型爬虫 */
        else {
            thisCreep.ManageMisson();
        }
    }
};

/**
 * 统计所有爬虫归属，统计数目 【已测试】
 */
function CreepNumStatistic() {
    if (!global.CreepNumData)
        global.CreepNumData = {};
    for (let roomName in Memory.RoomControlData) {
        if (Game.rooms[roomName] && !global.CreepNumData[roomName])
            global.CreepNumData[roomName] = {};
        if (global.CreepNumData[roomName]) {
            /* 所有角色数量归零 从0开始统计 */
            for (let roleName in global.CreepNumData[roomName])
                global.CreepNumData[roomName][roleName] = 0;
        }
    }
    /* 计算爬虫 */
    let shard = Game.shard.name;
    for (let c in Memory.creeps) {
        let creep_ = Game.creeps[c];
        /* 代表爬虫死亡或进入星门，清除记忆 */
        if (!creep_) {
            delete Memory.creeps[c];
            //console.log(`爬虫${c}的记忆已被清除！`)
            continue;
        }
        /* 代表爬虫没记忆或刚出星门  */
        if (!creep_.memory.role)
            continue;
        /* 代表爬虫是其他shard的来客 */
        if (creep_.memory.shard != shard)
            continue;
        /* 代表爬虫所属房间已经没了 */
        if (!Game.rooms[creep_.memory.belong])
            continue;
        if (!global.CreepNumData[creep_.memory.belong][creep_.memory.role])
            global.CreepNumData[creep_.memory.belong][creep_.memory.role] = 0;
        /* 添加统计数目 */
        global.CreepNumData[creep_.memory.belong][creep_.memory.role] += 1;
    }
}

function pixel() {
    if (Game.cpu.bucket >= 10000) {
        if (Game.shard.name != 'shard3') {
            Game.cpu.generatePixel();
        }
        else {
            let cpuUsed = Game.cpu.getUsed();
            if (cpuUsed <= 14)
                Game.cpu.generatePixel();
        }
    }
}

var dev = {
    "name": "",
    "shard": "shard0",
    "rcl": 8,
    "buildings": {
        "storage": {
            "pos": [
                { "x": 25, "y": 25 }
            ]
        },
        "tower": {
            "pos": [
                { "x": 25, "y": 24 },
                { "x": 24, "y": 25 },
                { "x": 25, "y": 26 },
                { "x": 27, "y": 23 },
                { "x": 23, "y": 23 },
                { "x": 23, "y": 27 }
            ]
        },
        "spawn": {
            "pos": [
                { "x": 25, "y": 23 },
                { "x": 23, "y": 25 },
                { "x": 25, "y": 27 }
            ]
        },
        "link": {
            "pos": [
                { "x": 26, "y": 25 }
            ]
        },
        "terminal": {
            "pos": [
                { "x": 27, "y": 27 }
            ]
        },
        "powerSpawn": {
            "pos": [
                { "x": 27, "y": 25 }
            ]
        },
        "extension": {
            "pos": [
                { "x": 28, "y": 24 },
                { "x": 28, "y": 23 },
                { "x": 28, "y": 22 },
                { "x": 27, "y": 22 },
                { "x": 26, "y": 22 },
                { "x": 27, "y": 21 },
                { "x": 28, "y": 21 },
                { "x": 29, "y": 22 },
                { "x": 29, "y": 23 },
                { "x": 29, "y": 20 },
                { "x": 30, "y": 21 },
                { "x": 30, "y": 20 },
                { "x": 25, "y": 21 },
                { "x": 26, "y": 20 },
                { "x": 24, "y": 20 },
                { "x": 24, "y": 22 },
                { "x": 23, "y": 21 },
                { "x": 22, "y": 21 },
                { "x": 22, "y": 22 },
                { "x": 23, "y": 22 },
                { "x": 22, "y": 23 },
                { "x": 22, "y": 24 },
                { "x": 21, "y": 23 },
                { "x": 21, "y": 22 },
                { "x": 20, "y": 21 },
                { "x": 21, "y": 20 },
                { "x": 20, "y": 20 },
                { "x": 19, "y": 22 },
                { "x": 19, "y": 23 },
                { "x": 20, "y": 24 },
                { "x": 20, "y": 25 },
                { "x": 20, "y": 26 },
                { "x": 21, "y": 25 },
                { "x": 19, "y": 27 },
                { "x": 19, "y": 28 },
                { "x": 31, "y": 22 },
                { "x": 31, "y": 23 },
                { "x": 30, "y": 24 },
                { "x": 30, "y": 25 },
                { "x": 29, "y": 25 },
                { "x": 21, "y": 27 },
                { "x": 21, "y": 28 },
                { "x": 22, "y": 27 },
                { "x": 22, "y": 26 },
                { "x": 22, "y": 28 },
                { "x": 22, "y": 29 },
                { "x": 23, "y": 29 },
                { "x": 23, "y": 28 },
                { "x": 24, "y": 28 },
                { "x": 20, "y": 29 },
                { "x": 20, "y": 30 },
                { "x": 21, "y": 30 },
                { "x": 22, "y": 31 },
                { "x": 23, "y": 31 },
                { "x": 25, "y": 30 },
                { "x": 26, "y": 31 },
                { "x": 24, "y": 30 },
                { "x": 25, "y": 29 },
                { "x": 28, "y": 19 },
                { "x": 27, "y": 19 }
            ]
        },
        "factory": {
            "pos": [
                { "x": 26, "y": 28 }
            ]
        },
        "nuker": {
            "pos": [
                { "x": 28, "y": 26 }
            ]
        },
        "road": {
            "pos": [
                { "x": 24, "y": 27 },
                { "x": 23, "y": 26 },
                { "x": 25, "y": 28 },
                { "x": 26, "y": 27 },
                { "x": 27, "y": 26 },
                { "x": 28, "y": 25 },
                { "x": 27, "y": 24 },
                { "x": 26, "y": 23 },
                { "x": 25, "y": 22 },
                { "x": 24, "y": 23 },
                { "x": 23, "y": 24 },
                { "x": 22, "y": 25 },
                { "x": 24, "y": 26 },
                { "x": 24, "y": 24 },
                { "x": 26, "y": 24 },
                { "x": 26, "y": 26 },
                { "x": 24, "y": 29 },
                { "x": 23, "y": 30 },
                { "x": 22, "y": 30 },
                { "x": 21, "y": 29 },
                { "x": 20, "y": 28 },
                { "x": 20, "y": 27 },
                { "x": 21, "y": 26 },
                { "x": 21, "y": 24 },
                { "x": 20, "y": 23 },
                { "x": 19, "y": 24 },
                { "x": 19, "y": 25 },
                { "x": 19, "y": 26 },
                { "x": 20, "y": 22 },
                { "x": 21, "y": 21 },
                { "x": 22, "y": 20 },
                { "x": 23, "y": 20 },
                { "x": 24, "y": 21 },
                { "x": 26, "y": 21 },
                { "x": 27, "y": 20 },
                { "x": 28, "y": 20 },
                { "x": 29, "y": 21 },
                { "x": 30, "y": 22 },
                { "x": 30, "y": 23 },
                { "x": 29, "y": 24 },
                { "x": 26, "y": 29 },
                { "x": 26, "y": 30 },
                { "x": 27, "y": 28 },
                { "x": 28, "y": 28 },
                { "x": 29, "y": 29 },
                { "x": 30, "y": 30 },
                { "x": 28, "y": 27 },
                { "x": 29, "y": 26 },
                { "x": 30, "y": 26 },
                { "x": 31, "y": 27 },
                { "x": 31, "y": 28 },
                { "x": 31, "y": 29 },
                { "x": 29, "y": 31 },
                { "x": 28, "y": 31 },
                { "x": 27, "y": 31 },
                { "x": 25, "y": 31 },
                { "x": 24, "y": 31 },
                { "x": 21, "y": 31 },
                { "x": 20, "y": 31 },
                { "x": 19, "y": 30 },
                { "x": 19, "y": 29 },
                { "x": 19, "y": 21 },
                { "x": 19, "y": 20 },
                { "x": 20, "y": 19 },
                { "x": 21, "y": 19 },
                { "x": 24, "y": 19 },
                { "x": 25, "y": 19 },
                { "x": 26, "y": 19 },
                { "x": 29, "y": 19 },
                { "x": 30, "y": 19 },
                { "x": 31, "y": 20 },
                { "x": 31, "y": 21 },
                { "x": 31, "y": 24 },
                { "x": 31, "y": 25 }
            ]
        },
        "observer": {
            "pos": [
                { "x": 31, "y": 26 }
            ]
        },
        "lab": {
            "pos": [
                { "x": 29, "y": 27 },
                { "x": 30, "y": 27 },
                { "x": 30, "y": 28 },
                { "x": 29, "y": 28 },
                { "x": 30, "y": 29 },
                { "x": 29, "y": 30 },
                { "x": 28, "y": 29 },
                { "x": 28, "y": 30 },
                { "x": 27, "y": 30 },
                { "x": 27, "y": 29 }
            ]
        }
    }
};

const colors = {
    gray: '#555555',
    light: '#AAAAAA',
    road: '#666',
    energy: '#FFE87B',
    power: '#F53547',
    dark: '#181818',
    outline: '#8FBB93',
    speechText: '#000000',
    speechBackground: '#2ccf3b'
};
const dirs = [
    [],
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
];
function relPoly(x, y, poly) {
    return poly.map(p => {
        p[0] += x;
        p[1] += y;
        return p;
    });
}
class RoomVisual$1 extends RoomVisual {
    connRoads(opts = {}) {
        let color = opts.color || colors.road || 'white';
        if (!this.roads)
            return;
        this.roads.forEach(r => {
            for (let i = 1; i <= 4; i++) {
                let d = dirs[i];
                let c = [r[0] + d[0], r[1] + d[1]];
                let rd = _.some(this.roads, r => r[0] == c[0] && r[1] == c[1]);
                if (rd) {
                    this.line(r[0], r[1], c[0], c[1], {
                        color: color,
                        width: 0.35,
                        opacity: opts.opacity || 1
                    });
                }
            }
        });
        return this;
    }
    structure(x, y, type, opts) {
        opts = Object.assign({
            opacity: 0.2
        }, opts);
        switch (type) {
            case STRUCTURE_RAMPART:
                this.rect(x - 0.5, y - 0.5, 1, 1, {
                    fill: '#434C43',
                    stroke: '#5D735F',
                    strokeWidth: 0.10,
                    opacity: opts.opacity
                });
                break;
            case STRUCTURE_LINK:
                let outer = [
                    [0.0, -0.5],
                    [0.4, 0.0],
                    [0.0, 0.5],
                    [-0.4, 0.0]
                ];
                let inner = [
                    [0.0, -0.3],
                    [0.25, 0.0],
                    [0.0, 0.3],
                    [-0.25, 0.0]
                ];
                outer = relPoly(x, y, outer);
                inner = relPoly(x, y, inner);
                outer.push(outer[0]);
                inner.push(inner[0]);
                this.poly(outer, {
                    fill: colors.dark,
                    stroke: colors.outline,
                    strokeWidth: 0.05,
                    opacity: opts.opacity
                });
                this.poly(inner, {
                    fill: colors.gray,
                    opacity: opts.opacity
                });
                break;
            case STRUCTURE_EXTENSION:
                this.circle(x, y, {
                    radius: 0.5,
                    fill: colors.dark,
                    stroke: colors.outline,
                    strokeWidth: 0.05,
                    opacity: opts.opacity
                });
                this.circle(x, y, {
                    radius: 0.35,
                    fill: colors.gray,
                    opacity: opts.opacity
                });
                break;
            case STRUCTURE_TOWER:
                this.circle(x, y, {
                    radius: 0.6,
                    fill: colors.dark,
                    stroke: colors.outline,
                    strokeWidth: 0.05,
                    opacity: opts.opacity
                });
                this.rect(x - 0.4, y - 0.3, 0.8, 0.6, {
                    fill: colors.gray,
                    opacity: opts.opacity
                });
                this.rect(x - 0.2, y - 0.9, 0.4, 0.5, {
                    fill: colors.light,
                    stroke: colors.dark,
                    strokeWidth: 0.07,
                    opacity: opts.opacity
                });
                break;
            case STRUCTURE_ROAD:
                this.circle(x, y, {
                    radius: 0.175,
                    fill: colors.road,
                    opacity: opts.opacity
                });
                if (!this.roads)
                    this.roads = [];
                this.roads.push([x, y]);
                break;
            case STRUCTURE_STORAGE:
                let outline1 = relPoly(x, y, [
                    [-0.45, -0.55],
                    [0, -0.65],
                    [0.45, -0.55],
                    [0.55, 0],
                    [0.45, 0.55],
                    [0, 0.65],
                    [-0.45, 0.55],
                    [-0.55, 0],
                    [-0.45, -0.55],
                ]);
                this.poly(outline1, {
                    stroke: colors.outline,
                    strokeWidth: 0.05,
                    fill: colors.dark,
                    opacity: opts.opacity
                });
                this.rect(x - 0.35, y - 0.45, 0.7, 0.9, {
                    fill: colors.energy,
                    opacity: opts.opacity,
                });
                break;
            case STRUCTURE_SPAWN:
                this.circle(x, y, {
                    radius: 0.65,
                    fill: colors.dark,
                    stroke: '#CCCCCC',
                    strokeWidth: 0.10,
                    opacity: opts.opacity
                });
                this.circle(x, y, {
                    radius: 0.40,
                    fill: colors.energy,
                    opacity: opts.opacity
                });
                break;
            case STRUCTURE_TERMINAL:
                {
                    let outer = [
                        [0.0, -0.8],
                        [0.55, -0.55],
                        [0.8, 0.0],
                        [0.55, 0.55],
                        [0.0, 0.8],
                        [-0.55, 0.55],
                        [-0.8, 0.0],
                        [-0.55, -0.55],
                    ];
                    let inner = [
                        [0.0, -0.65],
                        [0.45, -0.45],
                        [0.65, 0.0],
                        [0.45, 0.45],
                        [0.0, 0.65],
                        [-0.45, 0.45],
                        [-0.65, 0.0],
                        [-0.45, -0.45],
                    ];
                    outer = relPoly(x, y, outer);
                    inner = relPoly(x, y, inner);
                    outer.push(outer[0]);
                    inner.push(inner[0]);
                    this.poly(outer, {
                        fill: colors.dark,
                        stroke: colors.outline,
                        strokeWidth: 0.05,
                        opacity: opts.opacity
                    });
                    this.poly(inner, {
                        fill: colors.light,
                        opacity: opts.opacity
                    });
                    this.rect(x - 0.45, y - 0.45, 0.9, 0.9, {
                        fill: colors.gray,
                        stroke: colors.dark,
                        strokeWidth: 0.1,
                        opacity: opts.opacity
                    });
                    break;
                }
            case STRUCTURE_LAB:
                this.circle(x, y - 0.025, {
                    radius: 0.55,
                    fill: colors.dark,
                    stroke: colors.outline,
                    strokeWidth: 0.05,
                    opacity: opts.opacity
                });
                this.circle(x, y - 0.025, {
                    radius: 0.40,
                    fill: colors.gray,
                    opacity: opts.opacity
                });
                this.rect(x - 0.45, y + 0.3, 0.9, 0.25, {
                    fill: colors.dark,
                    opacity: opts.opacity
                });
                {
                    let box = [
                        [-0.45, 0.3],
                        [-0.45, 0.55],
                        [0.45, 0.55],
                        [0.45, 0.3],
                    ];
                    box = relPoly(x, y, box);
                    this.poly(box, {
                        stroke: colors.outline,
                        strokeWidth: 0.05,
                        opacity: opts.opacity
                    });
                }
                break;
            case STRUCTURE_POWER_SPAWN:
                this.circle(x, y, {
                    radius: 0.65,
                    fill: colors.dark,
                    stroke: colors.power,
                    strokeWidth: 0.10,
                    opacity: opts.opacity
                });
                this.circle(x, y, {
                    radius: 0.40,
                    fill: colors.energy,
                    opacity: opts.opacity
                });
                break;
            case STRUCTURE_OBSERVER:
                this.circle(x, y, {
                    fill: colors.dark,
                    radius: 0.45,
                    stroke: colors.outline,
                    strokeWidth: 0.05,
                    opacity: opts.opacity
                });
                this.circle(x + 0.225, y, {
                    fill: colors.outline,
                    radius: 0.20,
                    opacity: opts.opacity
                });
                break;
            case STRUCTURE_NUKER:
                let outline = [
                    [0, -1],
                    [-0.47, 0.2],
                    [-0.5, 0.5],
                    [0.5, 0.5],
                    [0.47, 0.2],
                    [0, -1],
                ];
                outline = relPoly(x, y, outline);
                this.poly(outline, {
                    stroke: colors.outline,
                    strokeWidth: 0.05,
                    fill: colors.dark,
                    opacity: opts.opacity
                });
                let inline = [
                    [0, -.80],
                    [-0.40, 0.2],
                    [0.40, 0.2],
                    [0, -.80],
                ];
                inline = relPoly(x, y, inline);
                this.poly(inline, {
                    stroke: colors.outline,
                    strokeWidth: 0.01,
                    fill: colors.gray,
                    opacity: opts.opacity
                });
                break;
            default:
                this.circle(x, y, {
                    fill: 'red'
                });
                break;
        }
    }
}

const drawByConfig = function (str) {
    let data;
    let xx;
    let yy;
    if (str == 'LayoutVisual') {
        xx = -25;
        yy = -25;
        data = dev;
    }
    let flag = Game.flags[str];
    if (!flag) {
        return;
    }
    let roomName = flag.pos.roomName;
    let terrian = new Room.Terrain(roomName);
    let rv = new RoomVisual$1(roomName);
    //    let poss = data.buildings['extension']['pos'];
    for (let type in data.buildings) {
        let poss = data.buildings[type]['pos'];
        for (let pos of poss) {
            let x = pos.x + xx + flag.pos.x;
            let y = pos.y + yy + flag.pos.y;
            try {
                if (terrian.get(x, y) != TERRAIN_MASK_WALL)
                    rv.structure(x, y, type);
            }
            catch (e) {
                log('err:' + x + "," + y + ',' + type);
                throw e;
            }
        }
    }
    // 墙
    let pos = flag.pos;
    for (let i = pos.x - 9; i < pos.x + 10; i++)
        for (let j = pos.y - 9; j < pos.y + 10; j++) {
            if (!isInArray([0, 1, 48, 49], i) && !isInArray([0, 1, 48, 49], j) && (Math.abs(i - pos.x) == 9 || Math.abs(j - pos.y) == 9) && terrian.get(i, j) != TERRAIN_MASK_WALL)
                rv.structure(i, j, STRUCTURE_RAMPART);
        }
    rv.connRoads();
};
function log(str, color = 'white') {
    console.log(`<span style="color:${color}">${str}</span>`);
}

// 轮子 非自创
function layoutVisual () {
    for (let name of ['LayoutVisual']) {
        let flag = Game.flags[name];
        if (flag) {
            drawByConfig(flag.name);
        }
    }
}

/* 常量文件 */
/**
 *
 * 爬虫位置用箭头表示，左上的爬虫：↖, 右上的爬虫：↗, 依此类推...
 *
 */
/* RoomPosition相对位置文字映射 (相对左上角的爬的位置 [x,y]) */
const SquadPos = {
    '↖': [0, 0],
    '↗': [1, 0],
    '↙': [0, 1],
    '↘': [1, 1]
};
/* move常量文字映射 */
const SquadDirection = {
    '↖': 8,
    '↗': 2,
    '↙': 6,
    '↘': 4,
    '↓': 5,
    '↑': 1,
    '←': 7,
    '→': 3
};
/* 房间出口方向文字-常量映射 */
({
    '↑': FIND_EXIT_TOP,
    '↓': FIND_EXIT_BOTTOM,
    '←': FIND_EXIT_LEFT,
    '→': FIND_EXIT_RIGHT
});
/* 爬虫执行战术动作后的记忆更改常量 以cross战术动作举例，原来左上爬虫的记忆为↖，交叉后更改为↘ */
const tactical = {
    cross: { '↖': '↘', '↗': '↙', '↙': '↗', '↘': '↖' },
    right: { '↖': '↗', '↗': '↘', '↘': '↙', '↙': '↖' },
    left: { '↗': '↖', '↘': '↗', '↙': '↘', '↖': '↙' },
};
/* 顺时针旋转(右转)移动常量  爬虫位置：爬虫移动方向 */
const rightConst = {
    '↖': '→',
    '↗': '↓',
    '↙': '↑',
    '↘': '←'
};
/* 逆时针旋转(左转)移动常量 爬虫位置：爬虫移动方向 */
const leftConst = {
    '↖': '↓',
    '↗': '←',
    '↙': '→',
    '↘': '↑'
};
/* 交叉移动常量 爬虫位置：爬虫移动方向 */
const crossConst = {
    '↖': '↘',
    '↗': '↙',
    '↙': '↗',
    '↘': '↖'
};

/* 四人小队状态判断函数 */
/* 小队中寻路的角色是左上角的爬，这个函数用来获取左上角的爬 */
function getStandCreep(Squad) {
    for (var i in Squad) {
        var thisCreep = Game.creeps[i];
        if (!thisCreep)
            continue;
        if (Squad[i].position == '↖')
            return thisCreep;
    }
    return null;
}
/* 获取小队阵型的左上角位置 (在小队成员不完整的情况下，依然能获取坐标) */
function getStandPos(squadData) {
    for (var i in squadData) {
        if (Game.creeps[i]) {
            if (squadData[i].position == '↖') {
                return Game.creeps[i].pos;
            }
        }
    }
    for (var i in squadData) {
        if (Game.creeps[i]) {
            if (squadData[i].position == '↖') {
                return Game.creeps[i].pos;
            }
            else if (squadData[i].position == '↗') {
                let thisPos = Game.creeps[i].pos;
                if (thisPos.x == 0) {
                    continue; // 不由该爬虫获取
                }
                return new RoomPosition(thisPos.x - 1, thisPos.y, thisPos.roomName);
            }
            else if (squadData[i].position == '↘') {
                let thisPos = Game.creeps[i].pos;
                if (thisPos.y == 0 || thisPos.x == 0) {
                    continue; // 不由该爬虫获取
                }
                return new RoomPosition(thisPos.x - 1, thisPos.y - 1, thisPos.roomName);
            }
            else if (squadData[i].position == '↙') {
                let thisPos = Game.creeps[i].pos;
                if (thisPos.y == 0) {
                    continue; // 不由该爬虫获取
                }
                return new RoomPosition(thisPos.x, thisPos.y - 1, thisPos.roomName);
            }
        }
    }
    return null;
}
/* 获取四人小队中指定位置爬的坐标 需要爬在2-48坐标范围内，太靠近边界无法使用 */
function SquadGetRoomPosition(Squad, pos) {
    let standPos = getStandPos(Squad);
    if (!standPos)
        return null;
    if (standPos.x > 48 || standPos.y > 48)
        return null;
    return new RoomPosition(standPos.x + SquadPos[pos][0], standPos.y + SquadPos[pos][1], standPos.roomName);
}
/* 获取小队中指定位置的爬 */
function SquadGetPosCreep(SquadData, pos) {
    for (var i in SquadData) {
        if (!Game.creeps[i])
            continue;
        else {
            if (SquadData[i].position == pos)
                return Game.creeps[i];
        }
    }
    return null;
}
/* 判断小队是否已经集结到位  true 到位 false 未到位 */
function SquadReady(SquadData) {
    var standPos = getStandPos(SquadData);
    if (!standPos)
        return true; // 如果集结爬死了，说明小队不需要再集结了，返回true方便其他爬执行其他事情
    var thisRoom = standPos.roomName;
    for (var cName in SquadData) {
        var disPos = SquadGetRoomPosition(SquadData, SquadData[cName].position);
        if (!Game.creeps[cName])
            continue;
        if ((Game.creeps[cName].room.name == thisRoom && disPos && !Game.creeps[cName].pos.isEqualTo(disPos)))
            return false;
    }
    return true;
}
/* 判断小队所有爬虫是否已经到了目标房间 */
function SquadArrivedRoom(SquadData, disRoom) {
    for (var cName in SquadData) {
        if (!Game.creeps[cName])
            continue;
        if (Game.creeps[cName].room.name != disRoom)
            return false;
    }
    return true;
}
/* 获取小队治疗爬朝向 */
function SquadHealDirection(SquadData) {
    var directionList = [];
    for (var cName in SquadData) {
        if (!Game.creeps[cName])
            return null;
        if (Game.creeps[cName].memory.creepType == 'heal')
            directionList.push(SquadData[cName].position);
    }
    if (isInArray(directionList, '↖') && isInArray(directionList, '↗'))
        return '↑';
    else if (isInArray(directionList, '↘') && isInArray(directionList, '↗'))
        return '→';
    else if (isInArray(directionList, '↘') && isInArray(directionList, '↙'))
        return '↓';
    else if (isInArray(directionList, '↖') && isInArray(directionList, '↙'))
        return '←';
    return null;
}
/* 获取小队攻击爬朝向 */
function SquadAttackDirection(SquadData) {
    var directionList = [];
    for (var cName in SquadData) {
        if (!Game.creeps[cName])
            return null;
        if (Game.creeps[cName].memory.creepType == 'attack')
            directionList.push(SquadData[cName].position);
    }
    if (isInArray(directionList, '↖') && isInArray(directionList, '↗'))
        return '↑';
    else if (isInArray(directionList, '↘') && isInArray(directionList, '↗'))
        return '→';
    else if (isInArray(directionList, '↘') && isInArray(directionList, '↙'))
        return '↓';
    else if (isInArray(directionList, '↖') && isInArray(directionList, '↙'))
        return '←';
    return null;
}
/* 返回目标相对小队的大致方向 */
function SquadPosDirection(SquadData, pos) {
    /* 计算位置和小队的距离 */
    var standPos = getStandPos(SquadData);
    if (!standPos)
        return null;
    var direction_ = null;
    var Xdistance = standPos.x - pos.x; // >0代表目标X方向在小队左边 <=-2代表目标X方向在小队右边  0 -1 代表目标X方向与小队有耦合
    var Ydistance = standPos.y - pos.y; // >0代表目标Y方向在小队上面 <=-2代表目标Y方向在小队下面  0 -1 代表目标Y方向与小队有耦合
    var absXdistance = Math.abs(Xdistance); // X方向距离差的绝对值
    var absYdistance = Math.abs(Ydistance); // Y方向距离差的绝对值
    if (Xdistance > 0) // 目标X方向整体在小队左边
     {
        if (Ydistance > 0) // 目标Y方向整体在小队上面
         {
            if (absXdistance < absYdistance) // 左上偏上
             {
                direction_ = '↑';
            }
            else if (absXdistance == absYdistance) // 正左上 返回null 不必要替换方向
             {
                direction_ = '↖';
            }
            else if (absXdistance > absYdistance) // 左上偏左
             {
                direction_ = '←';
            }
        }
        else if (Ydistance <= 0 && Ydistance > -2) // 目标Y方向整体在小队左边Y方向的耦合区域
         {
            direction_ = '←';
        }
        else if (Ydistance <= -2) // 目标Y方向整体在小队下面
         {
            if (absXdistance < (absYdistance - 1)) // 左下偏下   -1是因为小队是四人小队，我们需要以↙位置的爬为参照
             {
                direction_ = '↓';
            }
            else if (absXdistance == (absYdistance - 1)) // 正左下
             {
                direction_ = '↙';
            }
            else if (absXdistance > (absYdistance - 1)) // 左下偏左
             {
                direction_ = '←';
            }
        }
    }
    else if (Xdistance <= 0 && Xdistance > -2) // 目标与小队处于X方向上的耦合区域
     {
        if (Ydistance > 0) // 目标的Y方向在小队上面
         {
            direction_ = '↑';
        }
        else if (Ydistance <= 0 && Ydistance > -2) // 不会存在的情况，除非目标在小队内
         {
            direction_ = null;
        }
        else if (Ydistance <= -2) // 目标的Y方向在小队下面
         {
            direction_ = '↓';
        }
    }
    else if (Xdistance <= -2) // 目标X方向在小队右边
     {
        if (Ydistance > 0) // 目标Y方向在小队上面
         {
            if (absXdistance - 1 < absYdistance) // 右上偏上
             {
                direction_ = '↑';
            }
            else if (absXdistance - 1 == absYdistance) // 正右上
             {
                direction_ = '↗';
            }
            else if (absXdistance - 1 > absYdistance) // 右上偏下
             {
                direction_ = '→';
            }
        }
        else if (Ydistance <= 0 && Ydistance > -2) // 目标Y方向处于耦合区域
         {
            direction_ = '→';
        }
        else if (Ydistance <= -2) // 目标Y方向处于小队下方
         {
            if (absXdistance < absYdistance) // 右下偏下
             {
                direction_ = '↓';
            }
            else if (absXdistance == absYdistance) // 正右下
             {
                direction_ = '↘';
            }
            else if (absXdistance > absYdistance) // 右下偏右
             {
                direction_ = '→';
            }
        }
    }
    return direction_;
}

/* 四人小队寻路 */
/* squad阵型寻路移动通用函数  为了更好的反应，每一tick的寻路都是实时的，比较消耗cpu (话说都打架了还考虑什么cpu？) */
function squadMove(squadData, disPos, range) {
    let standPos = getStandPos(squadData);
    if (!standPos)
        return;
    const result = PathFinder.search(standPos, { pos: disPos, range: range }, {
        plainCost: 2,
        swampCost: 10,
        maxOps: 4000,
        roomCallback: roomName => {
            // 在绕过房间列表的房间将直接不让走
            if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName))
                return false;
            const room_ = Game.rooms[roomName];
            let costs = new PathFinder.CostMatrix;
            /** 设置地形 */
            const terrian = new Room.Terrain(roomName);
            /* 第一层设置沼泽 */
            for (let x = 0; x < 50; x++)
                for (let y = 0; y < 50; y++) {
                    if (terrian.get(x, y) == TERRAIN_MASK_SWAMP) {
                        costs.set(x, y, 10);
                        if (x > 2) {
                            costs.set(x - 1, y, 10);
                        }
                        if (y > 2) {
                            costs.set(x, y - 1, 10);
                        }
                        if (x > 2 && y > 2) {
                            costs.set(x - 1, y - 1, 10);
                        }
                    }
                }
            /* 第二层设置墙壁 */
            for (let x = 0; x < 50; x++)
                for (let y = 0; y < 50; y++) {
                    if (terrian.get(x, y) == TERRAIN_MASK_WALL) {
                        costs.set(x, y, 0xff);
                        if (x > 2) {
                            costs.set(x - 1, y, 0xff);
                        }
                        if (y > 2) {
                            costs.set(x, y - 1, 0xff);
                        }
                        if (x > 2 && y > 2) {
                            costs.set(x - 1, y - 1, 0xff);
                        }
                    }
                }
            if (!room_) {
                /* 没有视野就不访问其他内容 */
                return;
            }
            // 将其他地图中的道路设置为1，无法行走的建筑设置为255
            room_.find(FIND_STRUCTURES).forEach(struct => {
                if (struct.structureType !== STRUCTURE_CONTAINER && struct.structureType !== STRUCTURE_ROAD &&
                    (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                    costs.set(struct.pos.x - 1, struct.pos.y, 0xff);
                    costs.set(struct.pos.x, struct.pos.y - 1, 0xff);
                    costs.set(struct.pos.x - 1, struct.pos.y - 1, 0xff);
                }
            });
            /* 防止撞到其他虫子造成堵虫 */
            room_.find(FIND_CREEPS).forEach(creep => {
                /* 是要不是四人小队的爬都设置成255 */
                if (!isInArray(Object.keys(squadData), creep.name)) {
                    costs.set(creep.pos.x, creep.pos.y, 255);
                    costs.set(creep.pos.x - 1, creep.pos.y, 255);
                    costs.set(creep.pos.x, creep.pos.y - 1, 255);
                    costs.set(creep.pos.x - 1, creep.pos.y - 1, 255);
                }
            });
            return costs;
        }
    });
    /* 获取移动方向 */
    var direction = standPos.getDirectionTo(result.path[0]);
    if (!direction)
        return;
    for (var c in squadData) {
        if (Game.creeps[c]) {
            /* 如果有疲劳单位，就停止 */
            if (Game.creeps[c].fatigue)
                return;
            /* 如果没有腿子,就停止 */
            if (Game.creeps[c].getActiveBodyparts('move') <= 0)
                return;
            if (!SquadReady(squadData))
                return;
            /* 如果检测到要移动的方向是墙壁，就停止 */
            if (result.path[0].x <= 48 && result.path[0].y <= 48) {
                var nextPostion = new RoomPosition(result.path[0].x + SquadPos[squadData[c].position][0], result.path[0].y + SquadPos[squadData[c].position][1], result.path[0].roomName);
                if (nextPostion) {
                    if (nextPostion.lookFor(LOOK_TERRAIN)[0] == 'wall') {
                        Game.creeps[c].say("❗");
                        return;
                    }
                }
            }
        }
    }
    for (var c in squadData) {
        if (Game.creeps[c]) {
            Game.creeps[c].move(direction);
        }
    }
}
/* 判定小队是否已经接近目标了 */
function squadNear(squadData, disPos) {
    for (var i in squadData) {
        if (Game.creeps[i] && Game.creeps[i].pos.isNearTo(disPos)) {
            return true;
        }
    }
    return false;
}

/* 四人小队基本行为 */
/* 小队战术动作 斜插 */
function SquadCross(SquadData) {
    for (var cName in SquadData) {
        if (Game.creeps[cName] && Game.creeps[cName].fatigue)
            return;
    }
    for (var cName in SquadData) {
        if (!Game.creeps[cName])
            continue;
        Game.creeps[cName].move(SquadDirection[crossConst[SquadData[cName].position]]);
        SquadData[cName].position = tactical['cross'][SquadData[cName].position];
    }
}
/* 小队战术动作 右转 */
function SquadRight(SquadData) {
    for (var cName in SquadData) {
        if (Game.creeps[cName] && Game.creeps[cName].fatigue)
            return;
    }
    for (var cName in SquadData) {
        if (!Game.creeps[cName])
            continue;
        Game.creeps[cName].move(SquadDirection[rightConst[SquadData[cName].position]]);
        SquadData[cName].position = tactical['right'][SquadData[cName].position];
    }
}
/* 小队战术动作 左转 */
function SquadLeft(SquadData) {
    for (var cName in SquadData) {
        if (Game.creeps[cName] && Game.creeps[cName].fatigue)
            return;
    }
    for (var cName in SquadData) {
        if (!Game.creeps[cName])
            continue;
        Game.creeps[cName].move(SquadDirection[leftConst[SquadData[cName].position]]);
        SquadData[cName].position = tactical['left'][SquadData[cName].position];
    }
}
/* 进入目标房间前使用  治疗爬方向朝向目标房间的入口 */
function initSquad(thisRoom, disRoom, SquadData) {
    var Healdirection = SquadHealDirection(SquadData);
    if (Healdirection == null) {
        return;
    }
    else if (Healdirection == '←') {
        switch (Game.rooms[thisRoom].findExitTo(disRoom)) {
            case FIND_EXIT_LEFT: {
                break;
            }
            case FIND_EXIT_RIGHT: {
                SquadCross(SquadData);
                break;
            }
            case FIND_EXIT_BOTTOM: {
                SquadLeft(SquadData);
                break;
            }
            case FIND_EXIT_TOP: {
                SquadRight(SquadData);
                break;
            }
        }
    }
    else if (Healdirection == '→') {
        switch (Game.rooms[thisRoom].findExitTo(disRoom)) {
            case FIND_EXIT_LEFT: {
                SquadCross(SquadData);
                break;
            }
            case FIND_EXIT_RIGHT: {
                break;
            }
            case FIND_EXIT_BOTTOM: {
                SquadRight(SquadData);
                break;
            }
            case FIND_EXIT_TOP: {
                SquadLeft(SquadData);
                break;
            }
        }
    }
    else if (Healdirection == '↑') {
        switch (Game.rooms[thisRoom].findExitTo(disRoom)) {
            case FIND_EXIT_LEFT: {
                SquadLeft(SquadData);
                break;
            }
            case FIND_EXIT_RIGHT: {
                SquadRight(SquadData);
                break;
            }
            case FIND_EXIT_BOTTOM: {
                SquadCross(SquadData);
                break;
            }
            case FIND_EXIT_TOP: {
                break;
            }
        }
    }
    else if (Healdirection == '↓') {
        switch (Game.rooms[thisRoom].findExitTo(disRoom)) {
            case FIND_EXIT_LEFT: {
                SquadRight(SquadData);
                break;
            }
            case FIND_EXIT_RIGHT: {
                SquadLeft(SquadData);
                break;
            }
            case FIND_EXIT_BOTTOM: {
                break;
            }
            case FIND_EXIT_TOP: {
                SquadCross(SquadData);
                break;
            }
        }
    }
    return;
}
/* 根据小队攻击爬的方向和目标方向进行战术动作 使得攻击爬方向朝向目标方向 */
function SquadAttackOrient(Attackdirection, direction_, SquadData) {
    /* 根据自己的方向进行旋转 */
    if (Attackdirection == '←') {
        switch (direction_) {
            case '←': {
                break;
            }
            case '→': {
                SquadCross(SquadData);
                break;
            }
            case '↓': {
                SquadLeft(SquadData);
                break;
            }
            case '↑': {
                SquadRight(SquadData);
                break;
            }
        }
    }
    else if (Attackdirection == '→') {
        switch (direction_) {
            case '←': {
                SquadCross(SquadData);
                break;
            }
            case '→': {
                break;
            }
            case '↓': {
                SquadRight(SquadData);
                break;
            }
            case '↑': {
                SquadLeft(SquadData);
                break;
            }
        }
    }
    else if (Attackdirection == '↑') {
        switch (direction_) {
            case '←': {
                SquadLeft(SquadData);
                break;
            }
            case '→': {
                SquadRight(SquadData);
                break;
            }
            case '↓': {
                SquadCross(SquadData);
                break;
            }
        }
    }
    else if (Attackdirection == '↓') {
        switch (direction_) {
            case '←': {
                SquadRight(SquadData);
                break;
            }
            case '→': {
                SquadLeft(SquadData);
                break;
            }
            case '↓': {
                break;
            }
            case '↑': {
                SquadCross(SquadData);
                break;
            }
        }
    }
}
/* 小队所有队员各就各位 */
function SquadSteady(SquadData) {
    for (var i in SquadData) {
        if (!Game.creeps[i])
            continue;
        var disPos = SquadGetRoomPosition(SquadData, SquadData[i].position);
        /* 用不同的移动方式防止各种bug */
        if (Game.time % 3)
            Game.creeps[i].moveTo(disPos);
        else
            Game.creeps[i].goTo(disPos, 0);
    }
}
/* 小队寻找旗帜 */
function SquadColorFlagRange(SquadData, color) {
    /* 先寻找小队左上角的坐标 */
    var standedCreep = SquadGetPosCreep(SquadData, '↖');
    if (!standedCreep)
        return null;
    var disFlag = standedCreep.pos.findClosestByRange(FIND_FLAGS, { filter: (flag) => {
            return flag.color == color;
        } });
    if (disFlag)
        return disFlag;
    return null;
}
/* 小队寻找某类旗帜 */
function SquadNameFlagPath(SquadData, name) {
    let pos_ = getStandPos(SquadData);
    if (!pos_)
        return null;
    let disFlag = pos_.findClosestByPath(FIND_FLAGS, { filter: (flag) => {
            return flag.name.indexOf(name) == 0;
        } });
    if (disFlag)
        return disFlag;
    return null;
}
/* 小队行为 */
function Squadaction(SquadData) {
    for (var i in SquadData) {
        var creep = Game.creeps[i];
        if (!creep)
            continue;
        /* 治疗类型爬 */
        if (creep.memory.creepType == 'heal') {
            /* 寻找小队内血量最少的爬 */
            var woundCreep;
            for (var wc in SquadData) {
                if (Game.creeps[wc] && !woundCreep && Game.creeps[wc].hits < Game.creeps[wc].hitsMax)
                    woundCreep = Game.creeps[wc];
                if (Game.creeps[wc] && woundCreep) {
                    if (Game.creeps[wc].hits < woundCreep.hits)
                        woundCreep = Game.creeps[wc];
                }
            }
            if (woundCreep)
                creep.heal(woundCreep);
            else 
            /* 如果奶量都满的,就奶攻击爬 */
            {
                var index = SquadData[i].index;
                var disIndex;
                if (index == 1)
                    disIndex = 0;
                else if (index == 3)
                    disIndex = 2;
                else
                    disIndex = index;
                var disCreep;
                for (var Index in SquadData) {
                    if (SquadData[Index].index == disIndex && Game.creeps[Index])
                        disCreep = Game.creeps[Index];
                }
                if (!disCreep)
                    disCreep = creep;
                creep.heal(disCreep);
            }
            /* 如果有攻击部件，攻击附近血量最少的爬 */
            if (creep.getActiveBodyparts('ranged_attack') > 0) {
                var enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, { filter: (creep_) => {
                        return !isInArray(Memory.whitesheet, creep_.owner.username) && !creep_.pos.GetStructure('rampart');
                    } });
                var enemyCreep;
                if (enemy.length == 0) {
                    enemyCreep = enemy[0];
                }
                else if (enemy.length > 1) {
                    for (var ec of enemy) {
                        if (!enemyCreep)
                            enemyCreep = ec;
                        else {
                            if (ec.hits < enemyCreep.hits)
                                enemyCreep = ec;
                        }
                    }
                }
                if (enemyCreep) {
                    creep.rangedAttack(enemyCreep);
                }
                else
                    creep.rangedMassAttack();
                if (creep.memory.role == 'x-aio') ;
            }
        }
        /* 攻击类型的爬也有可能携带heal部件 */
        else if (creep.memory.creepType == 'attack') {
            /* 治疗自己 */
            if (creep.getActiveBodyparts('heal') > 0 && creep.hits < creep.hitsMax)
                creep.heal(creep);
            /* 如果有攻击部件，攻击附近血量最少的爬 */
            if (creep.getActiveBodyparts('ranged_attack') > 0) {
                var enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3, { filter: (creep_) => {
                        return !isInArray(Memory.whitesheet, creep_.owner.username) && !creep_.pos.GetStructure('rampart');
                    } });
                var enemyCreep = null;
                if (enemy.length == 1) {
                    enemyCreep = enemy[0];
                }
                else if (enemy.length > 1) {
                    for (var ec of enemy) {
                        if (!enemyCreep)
                            enemyCreep = ec;
                        else {
                            if (ec.hits < enemyCreep.hits)
                                enemyCreep = ec;
                        }
                    }
                }
                if (enemyCreep) {
                    creep.rangedAttack(enemyCreep);
                }
                else
                    creep.rangedMassAttack();
            }
            if (creep.getActiveBodyparts('attack') > 0) {
                var enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, { filter: (creep_) => {
                        return !isInArray(Memory.whitesheet, creep_.owner.username) && !creep_.pos.GetStructure('rampart');
                    } });
                if (enemy.length > 0) {
                    creep.attack(enemy[0]);
                }
                else {
                    let flag = creep.pos.findInRange(FIND_FLAGS, 1, { filter: (flag) => {
                            return flag.name.indexOf('squad_attack') == 0;
                        } });
                    if (flag.length > 0) {
                        let stru = flag[0].pos.GetStructureList(['rampart', 'extension', 'spawn', 'constructedWall', 'lab', 'nuker', 'powerSpawn', 'factory', 'terminal', 'storage', 'observer', 'extractor', 'tower']);
                        if (stru.length > 0) {
                            creep.attack(stru[0]);
                        }
                        else {
                            flag[0].remove();
                        }
                    }
                }
            }
            if (creep.getActiveBodyparts('work') > 0) {
                let flag = creep.pos.findInRange(FIND_FLAGS, 1, { filter: (flag) => {
                        return flag.name.indexOf('squad_attack') == 0;
                    } });
                if (flag.length > 0) {
                    let stru = flag[0].pos.GetStructureList(['rampart', 'extension', 'spawn', 'constructedWall', 'lab', 'nuker', 'powerSpawn', 'factory', 'terminal', 'storage', 'observer', 'extractor', 'tower']);
                    if (stru.length > 0) {
                        creep.dismantle(stru[0]);
                    }
                    else {
                        flag[0].remove();
                    }
                }
            }
        }
    }
}

/* 四人小队框架控制 */
// 主程序执行
function SquadManager() {
    if (!Memory.squadMemory)
        Memory.squadMemory = {};
    for (var squadID in Memory.squadMemory) {
        /* 先检查该任务的爬是否已经死光，如果死光了就清除数据 */
        let del = true;
        for (var creepName in Memory.squadMemory[squadID].creepData) {
            if (Game.creeps[creepName])
                del = false;
        }
        if (del) {
            delete Memory.squadMemory[squadID];
            continue;
        }
        /* 删除无用数据 */
        if (Game.time % 50 == 0) {
            for (var i in Memory.RoomControlData) {
                if (Game.rooms[i] && Game.rooms[i].controller.level >= 8) {
                    if (Game.rooms[i].MissionNum('Creep', '四人小队') <= 0) {
                        Game.rooms[i].memory.squadData = {};
                    }
                }
            }
        }
        /* 运行框架 */
        squardFrameWork(squadID);
    }
}
// 小队通用执行框架
function squardFrameWork(squardID) {
    var Data = Memory.squadMemory[squardID];
    if (!Data)
        return;
    /* 小队Memory中的爬虫数据 */
    var squadData = Data.creepData;
    /* 如果小队没有组队或者脱离组队，要进行的操作 */
    if (!Data.ready) {
        if (!SquadReady(squadData)) {
            SquadSteady(squadData);
        }
        else {
            Data.ready = true;
        }
        return;
    }
    /* 如果小队因为某些原因脱离了组队，需要赶紧组队 */
    if (!SquadReady(squadData)) {
        SquadSteady(squadData);
        Data.ready = false;
        return;
    }
    /* 如果小队还没有到目标房间 */
    if (!SquadArrivedRoom(squadData, Data.disRoom)) {
        /* 如果有蓝色旗帜，优先去蓝色旗帜那里集结  [集结] */
        var blueFlag = SquadColorFlagRange(squadData, COLOR_BLUE);
        if (!Data.gather && blueFlag) {
            squadMove(squadData, blueFlag.pos, 0);
            if (squadNear(squadData, blueFlag.pos)) {
                Data.gather = true;
            }
            return;
        }
        /* 优先调整坐标 */
        if (!Data.init) {
            Data.init = true;
            initSquad(Data.presentRoom, Data.disRoom, squadData);
            return;
        }
        squadMove(squadData, new RoomPosition(25, 25, Data.disRoom), 10);
        return;
    }
    /* 小队行为 攻击周围的敌人和建筑*/
    Squadaction(squadData);
    let attack_flag = SquadNameFlagPath(squadData, 'squad_attack');
    if (attack_flag) {
        if (attack_flag.pos.lookFor(LOOK_STRUCTURES).length <= 0)
            attack_flag.remove();
        else {
            var Attackdirection = SquadAttackDirection(Data.creepData);
            if (SquadPosDirection(squadData, attack_flag.pos) != null && Attackdirection != SquadPosDirection(squadData, attack_flag.pos)) {
                SquadAttackOrient(Attackdirection, SquadPosDirection(squadData, attack_flag.pos), squadData);
                return;
            }
            if (!squadNear(squadData, attack_flag.pos)) {
                squadMove(squadData, attack_flag.pos, 1);
            }
        }
    }
    else {
        let standCreep = getStandCreep(squadData);
        if (!standCreep)
            return;
        var clostStructure = standCreep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: (struc) => {
                return !isInArray([STRUCTURE_CONTROLLER, STRUCTURE_STORAGE], struc.structureType);
            } });
        if (clostStructure) {
            clostStructure.pos.createFlag(`squad_attack_${generateID()}`, COLOR_WHITE);
            return;
        }
        else {
            return;
        }
    }
    if (!attack_flag)
        return;
    /* retreat_xx 是紧急撤退标志 */
    var retreatFlag = SquadNameFlagPath(squadData, 'retreat');
    if (retreatFlag) {
        squadMove(squadData, blueFlag.pos, 0);
        if (squadNear(squadData, blueFlag.pos)) {
            retreatFlag.remove();
        }
        return;
    }
}

/* error map */
/**
 * 主运行函数
 */
const loop = ErrorMapper.wrapLoop(() => {
    /* Memory初始化 */
    MemoryInit(); // Memory room creep flag 
    /* 跨shard初始化 */
    InitShardMemory();
    /* 跨shard记忆运行 */
    InterShardRun();
    /* 原型拓展挂载 */
    Mount();
    /* 爬虫数量统计及死亡Memory回收 */
    CreepNumStatistic();
    /* 房间框架运行 */
    RoomWork();
    /* 爬虫运行 */
    CreepWork();
    /* 四人小队模块 */
    SquadManager();
    /* 资源调度超时管理 */
    ResourceDispatchTick();
    /* 像素 */
    pixel();
    /* 布局可视化 */
    layoutVisual();
});

exports.loop = loop;
//# sourceMappingURL=main.js.map
