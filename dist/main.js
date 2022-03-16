'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var sourceMapGenerator = {};

var base64Vlq = {};

var base64$1 = {};

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
base64$1.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
base64$1.decode = function (charCode) {
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

var base64 = base64$1;

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
base64Vlq.encode = function base64VLQ_encode(aValue) {
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
base64Vlq.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
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

var util$5 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

(function (exports) {
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
}(util$5));

var arraySet = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$4 = util$5;
var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet$2() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet$2.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet$2();
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
ArraySet$2.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet$2.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util$4.toSetString(aStr);
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
ArraySet$2.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util$4.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet$2.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util$4.toSetString(aStr);
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
ArraySet$2.prototype.at = function ArraySet_at(aIdx) {
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
ArraySet$2.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

arraySet.ArraySet = ArraySet$2;

var mappingList = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$3 = util$5;

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
         util$3.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList$1() {
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
MappingList$1.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList$1.prototype.add = function MappingList_add(aMapping) {
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
MappingList$1.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util$3.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

mappingList.MappingList = MappingList$1;

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ$1 = base64Vlq;
var util$2 = util$5;
var ArraySet$1 = arraySet.ArraySet;
var MappingList = mappingList.MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator$1(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util$2.getArg(aArgs, 'file', null);
  this._sourceRoot = util$2.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util$2.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet$1();
  this._names = new ArraySet$1();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator$1.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator$1.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator$1({
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
          newMapping.source = util$2.relative(sourceRoot, newMapping.source);
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
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util$2.relative(sourceRoot, sourceFile);
      }

      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }

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
SourceMapGenerator$1.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util$2.getArg(aArgs, 'generated');
    var original = util$2.getArg(aArgs, 'original', null);
    var source = util$2.getArg(aArgs, 'source', null);
    var name = util$2.getArg(aArgs, 'name', null);

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
SourceMapGenerator$1.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util$2.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util$2.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util$2.toSetString(source)];
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
SourceMapGenerator$1.prototype.applySourceMap =
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
      sourceFile = util$2.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet$1();
    var newNames = new ArraySet$1();

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
            mapping.source = util$2.join(aSourceMapPath, mapping.source);
          }
          if (sourceRoot != null) {
            mapping.source = util$2.relative(sourceRoot, mapping.source);
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
          sourceFile = util$2.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util$2.relative(sourceRoot, sourceFile);
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
SourceMapGenerator$1.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
        throw new Error(
            'original.line and original.column are not numbers -- you probably meant to omit ' +
            'the original mapping entirely and only map the generated position. If so, pass ' +
            'null for the original mapping instead of an object with empty or null values.'
        );
    }

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
SourceMapGenerator$1.prototype._serializeMappings =
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
      next = '';

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util$2.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ$1.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ$1.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ$1.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ$1.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ$1.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator$1.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util$2.relative(aSourceRoot, source);
      }
      var key = util$2.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator$1.prototype.toJSON =
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
SourceMapGenerator$1.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

sourceMapGenerator.SourceMapGenerator = SourceMapGenerator$1;

var sourceMapConsumer = {};

var binarySearch$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

(function (exports) {
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
}(binarySearch$1));

var quickSort$1 = {};

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
quickSort$1.quickSort = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$1 = util$5;
var binarySearch = binarySearch$1;
var ArraySet = arraySet.ArraySet;
var base64VLQ = base64Vlq;
var quickSort = quickSort$1.quickSort;

function SourceMapConsumer$1(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
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
      source = util$1.computeSourceURL(sourceRoot, source, this._sourceMapURL);
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
    var line = util$1.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util$1.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util$1.getArg(aArgs, 'column', 0)
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
                                  util$1.compareByOriginalPositions,
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
            line: util$1.getArg(mapping, 'generatedLine', null),
            column: util$1.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
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
            line: util$1.getArg(mapping, 'generatedLine', null),
            column: util$1.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

sourceMapConsumer.SourceMapConsumer = SourceMapConsumer$1;

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
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  var version = util$1.getArg(sourceMap, 'version');
  var sources = util$1.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util$1.getArg(sourceMap, 'names', []);
  var sourceRoot = util$1.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util$1.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util$1.getArg(sourceMap, 'mappings');
  var file = util$1.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util$1.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util$1.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util$1.isAbsolute(sourceRoot) && util$1.isAbsolute(source)
        ? util$1.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util$1.computeSourceURL(sourceRoot, s, aSourceMapURL);
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
    relativeSource = util$1.relative(this.sourceRoot, relativeSource);
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
      return util$1.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
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

    quickSort(smc.__originalMappings, util$1.compareByOriginalPositions);

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

    quickSort(generatedMappings, util$1.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util$1.compareByOriginalPositions);
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
      generatedLine: util$1.getArg(aArgs, 'line'),
      generatedColumn: util$1.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util$1.compareByGeneratedPositionsDeflated,
      util$1.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util$1.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util$1.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util$1.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util$1.getArg(mapping, 'originalLine', null),
          column: util$1.getArg(mapping, 'originalColumn', null),
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
      relativeSource = util$1.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util$1.urlParse(this.sourceRoot))) {
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
    var source = util$1.getArg(aArgs, 'source');
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
      originalLine: util$1.getArg(aArgs, 'line'),
      originalColumn: util$1.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util$1.compareByOriginalPositions,
      util$1.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util$1.getArg(mapping, 'generatedLine', null),
          column: util$1.getArg(mapping, 'generatedColumn', null),
          lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

sourceMapConsumer.BasicSourceMapConsumer = BasicSourceMapConsumer;

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
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  var version = util$1.getArg(sourceMap, 'version');
  var sections = util$1.getArg(sourceMap, 'sections');

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
    var offset = util$1.getArg(s, 'offset');
    var offsetLine = util$1.getArg(offset, 'line');
    var offsetColumn = util$1.getArg(offset, 'column');

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
      consumer: new SourceMapConsumer$1(util$1.getArg(s, 'map'), aSourceMapURL)
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
      generatedLine: util$1.getArg(aArgs, 'line'),
      generatedColumn: util$1.getArg(aArgs, 'column')
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
      if (section.consumer._findSourceIndex(util$1.getArg(aArgs, 'source')) === -1) {
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
        source = util$1.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
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

    quickSort(this.__generatedMappings, util$1.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util$1.compareByOriginalPositions);
  };

sourceMapConsumer.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = sourceMapGenerator.SourceMapGenerator;
var util = util$5;

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
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
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
          var nextLine = remainingLines[remainingLinesIndex] || '';
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
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
        var nextLine = remainingLines[remainingLinesIndex] || '';
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
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

// 缓存 SourceMap
let consumer = null;

// 第一次报错时创建 sourceMap
const getConsumer = function () {
	if (consumer == null) consumer = new SourceMapConsumer(require("main.js.map"));
	return consumer
};

// 缓存映射关系以提高性能
const cache = {};

/**
 * 使用源映射生成堆栈跟踪，并生成原始标志位
 * 警告 - global 重置之后的首次调用会产生很高的 cpu 消耗 (> 30 CPU)
 * 之后的每次调用会产生较低的 cpu 消耗 (~ 0.1 CPU / 次)
 *
 * @param {Error | string} error 错误或原始追踪栈
 * @returns {string} 映射之后的源代码追踪栈
 */
const sourceMappedStackTrace = function (error) {
	const stack = error instanceof Error ? error.stack : error;
	// 有缓存直接用
	if (cache.hasOwnProperty(stack)) return cache[stack]

	const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
	let match;
	let outStack = error.toString();
	console.log("ErrorMapper -> sourceMappedStackTrace -> outStack", outStack);

	while ((match = re.exec(stack))) {
		// 解析完成
		if (match[2] !== "main") break

		// 获取追踪定位
		const pos = getConsumer().originalPositionFor({
			column: parseInt(match[4], 10),
			line: parseInt(match[3], 10)
		});

		// 无法定位
		if (!pos.line) break

		// 解析追踪栈
		if (pos.name) outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
		else {
			// 源文件没找到对应文件名，采用原始追踪名
			if (match[1]) outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
			// 源文件没找到对应文件名并且原始追踪栈里也没有，直接省略
			else outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
		}
	}

	cache[stack] = outStack;
	return outStack
};

/**
 * 错误追踪包装器
 * 用于把报错信息通过 source-map 解析成源代码的错误位置
 * 和原本 wrapLoop 的区别是，wrapLoop 会返回一个新函数，而这个会直接执行
 *
 * @param next 玩家代码
 */
const errorMapper = function (next) {
	return () => {
		try {
			// 执行玩家代码
			next();
		}
		catch (e) {
			if (e instanceof Error) {
				// 渲染报错调用栈，沙盒模式用不了这个
				const errorMessage = Game.rooms.sim ?
					`沙盒模式无法使用 source-map - 显示原始追踪栈<br>${_.escape(e.stack)}` :
					`${_.escape(sourceMappedStackTrace(e))}`;

				console.log(`<text style="color:#ef9a9a">${errorMessage}</text>`);
			}
			// 处理不了，直接抛出
			else throw e
		}
	}
};

const p_creep = function () {
	_.assign(Creep.prototype, creepExtension);
};


const creepExtension = {
	/**
	 * creep执行
	 */
	work: function () {
		// 如果 creep 还没有发送重生信息的话，执行健康检查，保证只发送一次生成任务
		// 健康检查不通过则向 spawnList 发送自己的生成任务
		if (!this.memory.hasSendRebirth) {
			const health = this.isHealthy();
			if (!health) {
				//todo 向指定 spawn 推送生成任务
				this.memory.hasSendRebirth = true;
				Game.spawns[this.memory.spawnName].addTask(this.memory);//todo 内存中没有spawnName
			}
		}
	},
	/**
	 * creep更新重生标记的时间限制
	 * @return {boolean}
	 */
	isHealthy: function() {
		return this.ticksToLive > 100;
	},
	/**
	 * 填充所有 spawn 和 extension
	 * @return boolean
	 */
	fillSpawnEnergy() {
		// let targets = this.room.extensionsAndSpawn()
		// if (targets.length > 0) {
		// 	if (this.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
		// 		this.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
		// 	}
		// 	return false
		// } else {
		// 	return true
		// }
		var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
			filter: function (obj) {
				return (obj.structureType == STRUCTURE_EXTENSION || obj.structureType == STRUCTURE_SPAWN)
					&& obj.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			}
		});
		if (target) {
			if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
			}
			return false
		} else {
			return true
		}
	},
	/**
	 * 填充仓库
	 */
	fillStorage () {
		let target = this.room.storage;
		if (target) {
			for(let resourceType in this.store) {
				if (this.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
					this.moveTo(target);
				}
			}
			// if (this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
			// 	this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
			// }
		}
	},
	/**
	 * 填充所有 tower
	 * 全部填充返回true
	 * @return boolean
	 */
	fillTower() {
		let targets = this.room.towers();
		if (targets.length > 0) {
			// console.log(this.transfer(target, RESOURCE_ENERGY))
			if (this.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				this.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
			}
			return false
		} else {
			return true
		}
	},
	/**
	 * 修理所有建筑,除了墙
	 */
	buildAllStructures() {

	},
	/**
	 * 采集能量
	 * @param obj 资源对象
	 */
	harvestEnergy(obj) {

	},
	/**
	 * 去往内存中的targetRoomName
	 * @param roomName 去往的房间名
	 * @return {boolean}
	 */
	to_room(roomName) {
		if (this.room == Game.rooms[roomName]) {
			return true
		} else {
			const exitDir = this.room.findExitTo(roomName);// 找到通往另一个房间的出口方向
			const exit = this.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
			this.moveTo(exit, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 60});
			return false
		}
	}

};

const config = {
	"E18S54": {
		upgrader: {
			role: "upgrader",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "5bbcae039099fc012e6384c4",
			targetRoomName: "E18S54"
		},
		builder: {
			role: "builder",
			number: 0/*1*/,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		builder_lins: {
			role: "builder",
			number: 0/*1*/,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		harvester: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae039099fc012e6384c3",
			selfRoomName: "E18S54",
			targetId: "622b167460854a9acbf2bdbe",
			targetRoomName: "E18S54"
		},
		harvester1: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae039099fc012e6384c5",
			selfRoomName: "E18S54",
			targetId: "622f49233dac222b8a07c48f",
			targetRoomName: "E18S54"
		},
		harvester2: {// mineral 矿场资源
			role: "harvester",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcb37b40062e4259e94431",
			selfRoomName: "E18S54",
			targetId: "623039ecef7f9c58acebd978",
			targetRoomName: "E18S54"
		},
		carrier: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		carrie1: {
			role: "carrier",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
			selfId: "623039ecef7f9c58acebd978",
			selfRoomName: "E18S54",
			targetId: "6229becbd834b5981b3b33d1",
			targetRoomName: "E18S54"
		},
		repairer: {
			role: "repairer",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		defender: {},
		occupier: {
			role: "occupier",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
			selfId: "no",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		center: {
			role: "center",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, CARRY, CARRY, CARRY, CARRY],
			selfId: "622b08d96825c6e51cd766ed",// link
			selfRoomName: "E18S54",
			targetId: "6229becbd834b5981b3b33d1",// storage
			targetRoomName: "E18S54"
		},
		structures: {
			Link: {
				center: "622b08d96825c6e51cd766ed",
				from: ["622b167460854a9acbf2bdbe", "622f49233dac222b8a07c48f"],
				to: []
			},
			Tower: {
				attack: [],
				repair: {
					"622815f682606a45aacde400": 25,
					"622abfe68d3e7624f42731e0": 25
				},
			}
		},


		harvester999: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae159099fc012e63864f",
			selfRoomName: "E19S54",
			targetId: "622dd62b6bc5f44dff635f60",
			targetRoomName: "E19S54"
		},
		harvester998: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae159099fc012e638650",
			selfRoomName: "E19S54",
			targetId: "622dc93c40d11b64bed29cdd",
			targetRoomName: "E19S54"
		},
		upgrader999: {
			role: "upgrader",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK],
			selfId: "622dc93c40d11b64bed29cdd",
			selfRoomName: "E19S54",
			targetId: "5bbcae159099fc012e63864e",
			targetRoomName: "E19S54"
		},
		upgrader998: {
			role: "upgrader",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK],
			selfId: "622dd62b6bc5f44dff635f60",
			selfRoomName: "E19S54",
			targetId: "5bbcae159099fc012e63864e",
			targetRoomName: "E19S54"
		},
	},
	"E19S54": {
		occupier: {
			role: "occupier",
			number: 0,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, CARRY, WORK],
			selfId: "no",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		builder: {
			role: "builder",
			number: 0,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
			selfId: "622dd62b6bc5f44dff635f60",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		builder1: {
			role: "builder",
			number: 2,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
			selfId: "622fb9f05aaf2c52db20731e",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		upgrader: {
			role: "upgrader",
			number: 3,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "622fb9f05aaf2c52db20731e",
			selfRoomName: "E19S54",
			targetId: "5bbcae159099fc012e63864e",
			targetRoomName: "E19S54"
		},
		carrier: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
			selfId: "622dc93c40d11b64bed29cdd",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		carrie1: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
			selfId: "622dd62b6bc5f44dff635f60",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},

		structures: {
			Link: {
				center: "",
				from: [],
				to: []
			},
			Tower: {
				attack: [],
				repair: {
					"622ed20e8792ad7fb29012ec": 25
				},
			}
		},
	}

};

// Game.market.createOrder({
// 	type: ORDER_SELL,
// 	resourceType: RESOURCE_HYDROGEN,
// 	price: 6.3,
// 	totalAmount: 20000,
// 	roomName: "E18S54"
// });

// console.log(Game.market.getOrderById("买入的id").price - Game.market.calcTransactionCost(1, "你自己的房间名", Game.market.getOrderById("买入的id").roomName) * 1.5)
// console.log(Game.market.getOrderById("623095a12a7a9fa93d1ee32e").price - Game.market.calcTransactionCost(1, "E18S54", Game.market.getOrderById("623095a12a7a9fa93d1ee32e").roomName) * 1.5)

// "623077412a7a9f1ca3153d1d"
// Game.market.deal('623077412a7a9f1ca3153d1d', 1000, "E18S54");

const p_spawn = function () {
	_.assign(Spawn.prototype, spawnExtension);
};


const spawnExtension = {
	/**
	 * 对队列进行检查
	 */
	work: function () {
		// 自己已经在生成了 / 内存里没有生成队列 / 生产队列为空 就啥都不干
		if (this.spawning || !this.memory.spawnList || this.memory.spawnList.length == 0) return
		// 进行生成
		//todo 智能选择spawn的方法
		const spawnSuccess = this.mainSpawn(this.name, this.memory.spawnList[0]);
		// 生成成功后移除任务
		if (spawnSuccess) this.memory.spawnList.shift();
		//fruits.reverse(); 可以实现倒序,即最后一个排到前面
	},
	/**
	 * 添加任务
	 * @param taskName 任务名
	 * @return {number} 返回任务队列长度
	 */
	addTask: function (taskName) {
		this.memory.spawnList.push(taskName);
		return this.memory.spawnList.length
	},
	/**
	 * 生成creep
	 * @param data 要生成的creep的内存信息
	 * @param spawnName 从哪个spawn生成
	 * @return {boolean} 成功与否
	 */
	mainSpawn: function (spawnName, data) {
		let name = data.role + Game.time;
		let this_spawn = Game.spawns[spawnName];
		//todo body没有(通过json获取), 内存尽量少, 哪个spawn(其他方法,智能选择)
		let roomJson = config[this_spawn.room];
		let body = roomJson[data.role].body;
		let res = Game.spawns[spawnName].spawnCreep(body, name, {data});
		return res === OK;
	}

};

const p_room = function () {
	_.assign(Room.prototype, roomExtension);
};


const roomExtension = {
	/**
	 * 内存重新载入
	 */
	init: function () {
		//todo source
		// 塔的位置
		// spawn和extension
		// link 等等所有建筑的位置

		//todo WALL的位置

		//todo Mineral的类型

	},
	/**
	 * 建筑点位置缓存
	 * @return {*}
	 */
	allConstructionSite: function () {
		if (!this._structuresSites) {
			this._structuresSites = this.find(FIND_CONSTRUCTION_SITES);
		}
		return this._structuresSites
	},
	/**
	 * 资源位置缓存
	 * @return {*}
	 */
	sources: function () {
		if (!this._sources) {
			if (!this.memory.sourceIds) {
				this.memory.sourceIds = this.find(FIND_SOURCES).map(source => source.id);
			}
			this._sources = this.memory.sourceIds.map(id => Game.getObjectById(id));
		}
		return this._sources
	},
	/**
	 * 所有extension和spawn位置缓存
	 * @return {*}
	 */
	extensionsAndSpawn: function () {
		if (!this._extenAndSpawn) {
			this._extenAndSpawn = this.find(FIND_MY_STRUCTURES, {
				filter: function (obj) {
					return (obj.structureType == STRUCTURE_EXTENSION || obj.structureType == STRUCTURE_SPAWN)
						&& obj.store.getFreeCapacity(RESOURCE_ENERGY) > 0
				}
			});
		}
		return this._extenAndSpawn
	},
	towers: function () {
		if (!this._towers) {
			this._towers = this.find(FIND_MY_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType === STRUCTURE_TOWER) &&
						structure.store[RESOURCE_ENERGY] < 1000;
				}
			});
		}
		return this._towers
	},
	/**
	 *
	 * @param limitNum
	 * @param role
	 * @param selfId
	 * @param selfRoomName
	 * @param targetId
	 * @param targetRoomName
	 * @param spawnName
	 * @param body
	 * @return {boolean}
	 */
	keep_creep_num: function (limitNum, role, selfId, selfRoomName, targetId, targetRoomName, spawnName, body) {
		let creeps = _.filter(Game.creeps, (creep) =>
			creep.memory.role == role
			&& creep.memory.targetId == targetId && creep.memory.targetRoomName == targetRoomName
			&& creep.memory.selfId == selfId && creep.memory.selfRoomName == selfRoomName);
		// console.log(role + " " + limitNum + " " + creeps.length + " || " + selfId + " " + selfRoomName + " " + targetId + " " + targetRoomName + " " + spawnName)
		if (creeps.length < limitNum) {
			var name = role + Game.time;
			Game.spawns[spawnName].spawnCreep(body, name, {
				memory:
					{
						role: role,
						selfId: selfId,
						selfRoomName: selfRoomName,
						targetId: targetId,
						targetRoomName: targetRoomName,
						spawnName: spawnName
						// hasSendRebirth: false
					}
			});
			return creeps.length
		} else {
			return creeps.length
		}
	},
	/**
	 * 发现敌人并缓存
	 * @return {*}
	 */
	checkEnemy: function () {
		if (!this._enemys) {
			this._enemys = this.find(FIND_HOSTILE_CREEPS);
		}
		return this._enemys
	}

};

const p_tower = function () {
	_.assign(StructureTower.prototype, towerExtension);
};

//todo 发现敌人放到room里写
const towerExtension = {

	//todo 指定范围维修,指定类型维修
	// 层次修墙(repairer做的)

	/**
	 * 塔的治疗和攻击
	 */
	run: function () {
		p_room();
		var creep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (creep) {
			this.attack(creep);
		}
		creep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: function (obj) {
				return obj.hits < obj.hitsMax;
			}
		});
		if (creep) {
			this.heal(creep);
		}
	},
	run_1: function () {
		p_room();
		// 维修
		this.fixStructure();
		// 搜索敌人并打击
		this.attack_creep();
		// 治疗creep
		this.healCreep();
	},
	/**
	 * 单纯攻击
	 */
	run_attack: function () {
		this.attack_creep();
	},
	/**
	 * 范围修复加全局攻击
	 */
	run_range: function (range) {
		if (!this.attack_creep()) {
			//todo 治疗最近
			if (!this.healCreep()) {
				this.fix_range_structure(range);
			}
		}
	},
	/**
	 * 攻击敌人
	 * @return {boolean}
	 */
	attack_creep: function () {
		// var creep = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
		var creep = this.room.checkEnemy()[0];
		if (creep) {
			if (this.attack(creep) === OK) {
				return true
			}
		}
		return false
	},
	healCreep: function () {
		var creep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: function (obj) {
				return obj.hits < obj.hitsMax;
			}
		});
		if (creep) {
			this.heal(creep);
			return true
		}
		return false
	},
	fixStructure: function () {
		var structure = this.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: function (structure) {
				return (structure.structureType != STRUCTURE_WALL
						&& structure.structureType != STRUCTURE_RAMPART)
					&& structure.hits < (structure.hitsMax* 4 / 5)
				// return structure.hits < structure.hitsMax
			}
		});
		if (structure) {
			this.repair(structure);
		} else {
			structure = this.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: function (structure) {
					return (structure.structureType == STRUCTURE_WALL
							|| structure.structureType == STRUCTURE_RAMPART)
						&& structure.hits < 1000
					// return structure.hits < structure.hitsMax
				}
			});
			if (structure) {
				this.repair(structure);
			}
		}
	},
	/**
	 *
	 * @param range
	 */
	fix_range_structure: function (range = 25) {
		//todo 添加container和rampart?
		let structures = this.pos.findInRange(FIND_STRUCTURES, range, {
			filter: function (structure) {
				return (structure.structureType != STRUCTURE_WALL
						&& structure.structureType != STRUCTURE_RAMPART)
					&& structure.hits < (structure.hitsMax* 4 / 5)
				// return structure.hits < structure.hitsMax
			}
		});
		if (structures.length > 0) {
			this.repair(structures[0]);
		} else {
			structures = this.pos.findInRange(FIND_STRUCTURES, range, {
				filter: function (structure) {
					return (structure.structureType == STRUCTURE_WALL
							|| structure.structureType == STRUCTURE_RAMPART)
						&& structure.hits < 300
					// return structure.hits < structure.hitsMax
				}
			});
			if (structures.length > 0) {
				this.repair(structures[0]);
			}
		}
	}
};

const p_link = function () {
	_.assign(StructureLink.prototype, linkExtension);
};

const linkExtension = {
	//todo 三个link
	// 源link传能量,中央link接受能量,防御link接收
	// 中央LinkId存到json中
	// 先完成源到中心

	work: function () {
		let linkConfig = config[this.room.name]["structures"].Link;
		let centerLink = Game.getObjectById(linkConfig.center);
		let fromMap = [];
		for (let i=0; i<linkConfig.from.length; i++) {
			fromMap[linkConfig.from[i]] = 1;
		}
		let toMap = [];
		for (let i=0; i<linkConfig.to.length; i++) {
			toMap[linkConfig.to[i]]++;
		}

		if (fromMap[this.id] == 1) {
			this.transferEnergy(centerLink);
		}
		//todo 战争状态,传送给其他link的没写


	},
};

const mount = function () {
	p_creep();
	p_spawn();
	p_room();
	p_tower();
	p_link();
};

/**
 * 房间运行
 * @type {{}}
 */
const setting_room_layout = {
	/**
	 * 执行设置
	 * @param roomName
	 */
	run: function (roomName) {
		// if (Game.time % 500 == 0) {
		// 	this.creep_centralization(roomName)
		// } else {
		// 	this.creep_distributed(roomName)
		// }
		this.creep_centralization(roomName);

		//todo 根据配置文件执行
		this.structure_load(roomName);
	},
	structure_load: function (roomName) {
		try {
			let room = Game.rooms[roomName];
			//todo 捡起
			this.pick_sources(room);
			let level = room.controller.level;
			let roomConfig = config[roomName];
			//todo Link和塔
			this.towerConfig(roomConfig["structures"].Tower);

			// this.linkConfig(roomConfig["structures"].Link)
		} catch (e) {
			console.log(roomName + "建筑异常");
		}

	},
	/**
	 * 捡起所有掉落资源
	 * @param room
	 */
	pick_sources: function (room) {
		var targets = room.find(FIND_DROPPED_RESOURCES);
		if (targets.length > 0) {
			for (let i=0; i<targets.length; i++) {
				var creep = targets[i].pos.findInRange(FIND_MY_CREEPS, 1)[0];
				if (creep) {
					creep.pickup(targets[i]);
				}
			}
		} else {
			targets = room.find(FIND_TOMBSTONES);
			for (let i=0; i<targets.length; i++) {
				creep = targets[i].pos.findInRange(FIND_MY_CREEPS, 1)[0];
				if (creep) {
					creep.withdraw(targets[i], RESOURCE_ENERGY);
				}
			}
		}
	},
	/**
	 * 根据配置执行塔逻辑
	 * @param towerConfig
	 */
	towerConfig: function (towerConfig) {
		// 攻击
		for (let towerId in towerConfig.attack) {
			console.log(towerId);
			Game.getObjectById(towerId).run_attack();
		}
		// 维修
		for (let towerId in towerConfig.repair) {
			var range = towerConfig.repair[towerId];
			Game.getObjectById(towerId).run_range(range);
		}
	},
	/**
	 * 分布式
	 */
	creep_distributed: function (roomName) {
		mount();
		let room = Game.rooms[roomName];
		room.controller.level;
		let spawn;

		//todo 有两套方案,计数形式和分布式,计数式隔1h1次

		for (let spawnName in Game.spawns) {
			spawn = Game.spawns[spawnName];
			spawn.work();
		}
	},
	/**
	 * 集中式
	 * @param roomName
	 */
	creep_centralization: function (roomName) {
		mount();
		let room = Game.rooms[roomName];
		// let level = room.controller.level
		let roomConfig = config[roomName];

		for (let role in roomConfig) {
			room.keep_creep_num(roomConfig[role].number, roomConfig[role].role,
				roomConfig[role].selfId, roomConfig[role].selfRoomName,
				roomConfig[role].targetId, roomConfig[role].targetRoomName,
				roomConfig[role].spawnName, roomConfig[role].body);
		}
	}
};

const role_harvester = function (creep) {
	mount();
	if (creep.store.getFreeCapacity() == 0) {//可用容量没了 target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = Game.getObjectById(creep.memory.targetId);
			for (let sources in creep.store) {
				if (creep.transfer(target, sources) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30});
				}
			}

			if (target.structureType === STRUCTURE_LINK && target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
				target.work();
			}
		} else {
			creep.to_room(creep.memory.targetRoomName);
		}
	} else {// self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var target = Game.getObjectById(creep.memory.selfId);
			if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30});
			}
		} else {
			creep.to_room(creep.memory.selfRoomName);
		}
	}
};

/**
 * self 取资源
 * target 为controller的Id
 * @param creep
 */
const role_upgrader = function (creep) {

	mount();
	if (creep.store[RESOURCE_ENERGY] == 0) {// 资源为0 self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var target = Game.getObjectById(creep.memory.selfId);
			if (target) {
				if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		} else {
			creep.to_room(creep.memory.selfRoomName);
		}
	} else {// target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = Game.getObjectById(creep.memory.targetId);
			// if (creep.upgradeController(target) === ERR_NOT_IN_RANGE) {
			// 	creep.moveTo(target);
			// }
			creep.moveTo(target);
			creep.upgradeController(target);

		} else {
			creep.to_room(creep.memory.targetRoomName);
		}
	}
};

/**
 * 建造者
 * targetId是取出的建筑的id,必须默认从storage取出能量
 * targetRoomName代表要修建的房间名
 * 没有target
 * @param creep
 */
const role_builder = function (creep) {
	mount();
	if (creep.store[RESOURCE_ENERGY] == 0) {// self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var target = Game.getObjectById(creep.memory.selfId);
			if (target) {
				if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		} else {
			creep.to_room(creep.memory.selfRoomName);
		}
	} else {// target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var targets = creep.room.allConstructionSite();
			if (targets.length > 0) {
				// if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
				// 	creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
				// }
				creep.build(targets[0]);
				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
			}
		} else {
			creep.to_room(creep.memory.targetRoomName);
		}
	}
};

const role_carrier = function (creep) {
	mount();
	creep.room.storage;
	creep.room.terminal;

	// for (const resourceType in target.store) {
	// 	if (creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
	// 		creep.moveTo(target)
	// 	}

	if (creep.store.getUsedCapacity() == 0) {//没有资源, self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var obj = Game.getObjectById(creep.memory.selfId);
			if (obj.store[RESOURCE_ENERGY] == 0) {
				for (let sources in obj.store) {
					if (creep.withdraw(obj, sources) === ERR_NOT_IN_RANGE) {
						creep.moveTo(obj, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
					}
				}
			} else {
				if (creep.withdraw(obj, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.moveTo(obj, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
				}
			}

		} else {
			creep.to_room(creep.memory.selfRoomName);
		}
	} else {// target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			if (creep.memory.targetId == "no") {
				if (creep.fillSpawnEnergy()) {
					if (creep.fillTower()) {
						creep.fillStorage();
					}
				}
			} else {
				let target = Game.getObjectById(creep.memory.targetId);
				for (let sources in creep.store) {
					if (creep.transfer(target, sources) === ERR_NOT_IN_RANGE) {
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
					}
				}
			}
		} else {
			creep.to_room(creep.memory.targetRoomName);
		}
	}
};

const roleCenter = function (creep) {
	mount();

	if (!link_to_storage(creep)) {
		storage_to_terminal(creep, RESOURCE_HYDROGEN);
	}

	//
	// 		//todo 转移资源
	// 		//toTerminal(creep)
	// 		//toStorage(creep)
	//
	// 		// RESOURCE_HYDROGEN
};

/**
 * 把link中的能量转移
 * @param creep
 * @return boolean
 */
function link_to_storage(creep) {
	var link = Game.getObjectById(creep.memory.selfId);
	if (link.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
		return false
	}
	if (creep.store.getFreeCapacity() == 0) {//可用容量没了 target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = Game.getObjectById(creep.memory.targetId);// 存放的Id
			for (let sources in target.store) {
				if (creep.transfer(target, sources) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30});
				}
			}
		} else {
			creep.to_room(creep.memory.targetRoomName);
		}
	} else {// self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			if (creep.withdraw(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(link, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30});
			}
		} else {
			creep.to_room(creep.memory.selfRoomName);
		}
	}
	return true
}

/**
 * 资源从storage转移至terminal
 * @param creep
 * @param sources
 */
function storage_to_terminal(creep, sources) {
	if (creep.store.getFreeCapacity() == 0) {
		if(creep.transfer(creep.room.terminal, sources) === ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.terminal);
		}
	} else {
		if(creep.withdraw(creep.room.storage, sources) === ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.storage);
		}
	}
}

const role_defender = function (creep) {
		mount();
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (target) {
				if (creep.attack(target) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			} else {
				if (creep.attack(Game.getObjectById("622898208de18e47ef24d8df")) === ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById("622898208de18e47ef24d8df"), {visualizePathStyle: {stroke: '#ffaa00'}});
				}
				// let x = Math.ceil(Math.random() * 40)
				// let y = Math.ceil(Math.random() * 40)
				// creep.moveTo(x, y, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		} else {
			creep.to_room(creep.memory.selfRoomName);
		}
};

const role_occupier = function (creep) {
	mount();
	//todo 降低(攻击),占领以及签名,之后进行建造

	if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
		if (creep.room.controller.my) {
			//todo 建造
			if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
				creep.memory.building = false;
				creep.say('🔄 harvest');
			}
			if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
				creep.memory.building = true;
				creep.say('🚧 build');
			}
			if (creep.memory.building) {
				var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
				if (targets.length) {
					if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
					}
				}
			} else {
				var sources = creep.room.find(FIND_SOURCES);
				if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			}

		} else {
			if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
				// creep.attackController(creep.room.controller)
				// creep.signController(creep.room.controller, "Bug fixes")
				creep.moveTo(creep.room.controller);
			}
		}

	} else {
		creep.to_room(creep.memory.selfRoomName);
	}


		// if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
		// 	creep.memory.upgrading = false;
		// 	creep.say('🔄 harvest');
		// }
		// if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
		// 	creep.memory.upgrading = true;
		// 	creep.say('⚡ upgrade');
		// }
		//
		// if (creep.memory.upgrading) {
		// 	if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
		// 		creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
		// 	}
		// } else {
		// 	// var sources = creep.room.find(FIND_SOURCES);
		// 	// if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
		// 	// 	creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
		// 	// }
		//
		// 	var sources = creep.room.find(FIND_RUINS);
		// 	if (creep.withdraw(sources[2], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
		// 		creep.moveTo(sources[2], {visualizePathStyle: {stroke: '#ffaa00'}});
		// 	}
		// }

};

const role_repairer = function (creep) {
	mount();
	if (creep.store[RESOURCE_ENERGY] == 0) {// self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			let obj = Game.getObjectById(creep.memory.selfId);
			if (creep.withdraw(obj, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(obj);
			}
		} else {
			creep.to_room(creep.memory.selfRoomName);
		}
	} else {// target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) &&
						structure.hits < 300000;
				}
			});
			if (target) {
				if (creep.repair(target) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
				}
			}
		} else {
			creep.to_room(creep.memory.targetRoomName);
		}
	}
};

/**

特别感谢： @[E29N27|重构咕] CXuesong  提供技术支持

使用方法：
require 后，控制台输入：

1. HelperRoomResource.showAllRes()

2. 显示后 鼠标放在资源上面会显示全部自己房间的资源

3. 点击房间 可以跳转到房间

 */
function tips(text, tipStrArray, id, left) {
	left = left - 1;
	left *= 100;
	let showCore = tipStrArray.map(e => `<t onclick="goto('${e}')"> ${e} </t>`.replace(/[\\"]/g, '%')).join("<br>");
	let time = Game.time;
	return `<t class="a${id}-a${time}">${text}</t><script>
function goto(e){
    let roomName = e.split(":")[0].replace(/\\s+/g, "");
    window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1)+roomName;
};
(() => {
    const button = document.querySelector(".a${id}-a${time}");
    let tip;
    button.addEventListener("pointerenter", () => {
        tip = document.createElement("div");
        tip.style.backgroundColor = "rgba(43,43,43,1)"; 
        tip.style.border = "1px solid";
        tip.style.borderColor = "#ccc";
        tip.style.borderRadius = "5px";
        tip.style.position = "absolute";
        tip.style.zIndex=10;
        tip.style.color = "#ccc";
        tip.style.marginLeft = "${left}px";
        tip.width = "230px";
        tip.innerHTML = "${showCore}".replace(/[\\%]/g,'"'); button.append(tip);
    });
    button.addEventListener("pointerleave", () => {tip && (tip.remove(), tip = undefined);});
    })()
</script>
`.replace(/[\r\n]/g, "");
}

//alert(window.location.href.substr(0,window.location.href.lastIndexOf("/")+1)+roomName);
let pro = {

	getStorageTerminalRes: function (room) {
		let store = {};
		if (room.storage) pro.addStore(store, room.storage.store);
		if (room.terminal) pro.addStore(store, room.terminal.store);
		// if(room.factory)pro.addStore(store,room.factory.store)
		return store
	},
	addStore: (store, b) => {
		for (let v in b) if (b[v] > 0) store[v] = (store[v] || 0) + b[v];
		return store
	},
	showAll() {

		let rooms = _.values(Game.rooms).filter(e => e.controller && e.controller.my && (e.storage || e.terminal));
		let roomResAll = rooms.map(e => [e.name, pro.getStorageTerminalRes(e)]).reduce((map, entry) => {
			map[entry[0]] = entry[1];
			return map
		}, {});


		let all = rooms.reduce((all, room) => pro.addStore(all, roomResAll[room.name]), {});


		// StrategyMarket.showAllRes()
		let time = Game.cpu.getUsed();
		let base = [RESOURCE_ENERGY, "U", "L", "K", "Z", "X", "O", "H", RESOURCE_POWER, RESOURCE_OPS];
		// 压缩列表
		let bars = [RESOURCE_BATTERY, RESOURCE_UTRIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_KEANIUM_BAR, RESOURCE_ZYNTHIUM_BAR, RESOURCE_PURIFIER, RESOURCE_OXIDANT, RESOURCE_REDUCTANT, RESOURCE_GHODIUM_MELT];
		// 商品
		let c_grey = [RESOURCE_COMPOSITE, RESOURCE_CRYSTAL, RESOURCE_LIQUID];
		let c_blue = [RESOURCE_DEVICE, RESOURCE_CIRCUIT, RESOURCE_MICROCHIP, RESOURCE_TRANSISTOR, RESOURCE_SWITCH, RESOURCE_WIRE, RESOURCE_SILICON].reverse();
		let c_yellow = [RESOURCE_MACHINE, RESOURCE_HYDRAULICS, RESOURCE_FRAME, RESOURCE_FIXTURES, RESOURCE_TUBE, RESOURCE_ALLOY, RESOURCE_METAL].reverse();
		let c_pink = [RESOURCE_ESSENCE, RESOURCE_EMANATION, RESOURCE_SPIRIT, RESOURCE_EXTRACT, RESOURCE_CONCENTRATE, RESOURCE_CONDENSATE, RESOURCE_MIST].reverse();
		let c_green = [RESOURCE_ORGANISM, RESOURCE_ORGANOID, RESOURCE_MUSCLE, RESOURCE_TISSUE, RESOURCE_PHLEGM, RESOURCE_CELL, RESOURCE_BIOMASS].reverse();
		// boost
		let b_grey = ["OH", "ZK", "UL", "G"];
		let gent = (r) => [r + "H", r + "H2O", "X" + r + "H2O", r + "O", r + "HO2", "X" + r + "HO2"];
		let b_blue = gent("U");
		let b_yellow = gent("Z");
		let b_pink = gent("K");
		let b_green = gent("L");
		let b_withe = gent("G");


		let formatNumber = function (n) {
			var b = parseInt(n).toString();
			var len = b.length;
			if (len <= 3) {
				return b;
			}
			var r = len % 3;
			return r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") : b.slice(r, len).match(/\d{3}/g).join(",");
		};
		let str = "";
		let colorMap = {
			[RESOURCE_ENERGY]: "rgb(255,242,0)",
			"Z": "rgb(247, 212, 146)",
			"L": "rgb(108, 240, 169)",
			"U": "rgb(76, 167, 229)",
			"K": "rgb(218, 107, 245)",
			"X": "rgb(255, 192, 203)",
			"G": "rgb(255,255,255)",
			[RESOURCE_BATTERY]: "rgb(255,242,0)",
			[RESOURCE_ZYNTHIUM_BAR]: "rgb(247, 212, 146)",
			[RESOURCE_LEMERGIUM_BAR]: "rgb(108, 240, 169)",
			[RESOURCE_UTRIUM_BAR]: "rgb(76, 167, 229)",
			[RESOURCE_KEANIUM_BAR]: "rgb(218, 107, 245)",
			[RESOURCE_PURIFIER]: "rgb(255, 192, 203)",
			[RESOURCE_GHODIUM_MELT]: "rgb(255,255,255)",
			[RESOURCE_POWER]: "rgb(224,90,90)",
			[RESOURCE_OPS]: "rgb(224,90,90)",
		};
		let id = 0;
		let addList = function (list, color) {
			let uniqueColor = function (str, resType) {
				if (colorMap[resType]) str = "<font style='color: " + colorMap[resType] + ";'>" + str + "</font>";
				return str
			};
			if (color) str += "<div style='color: " + color + ";'>";
			let left = 0;
			let getAllRoom = function (text, resType) {
				let arr = [];
				for (let roomName in roomResAll) {
					arr.push(_.padLeft(roomName, 6) + ":" + _.padLeft(formatNumber(roomResAll[roomName][resType] || 0), 9));
				}
				id += 1;
				left += 1;
				return tips(text, arr, id, left)
			};
			list.forEach(e => str += getAllRoom(uniqueColor(_.padLeft(e, 15), e), e));
			str += "<br>";
			list.forEach(e => str += uniqueColor(_.padLeft(formatNumber(all[e] || 0), 15), e));
			str += "<br>";
			if (color) str += "</div>";
		};
		str += "<br>基础资源:<br>";
		addList(base);
		str += "<br>压缩资源:<br>";
		addList(bars);
		str += "<br>商品资源:<br>";
		addList(c_grey);
		addList(c_blue, "rgb(76, 167, 229)");
		addList(c_yellow, "rgb(247, 212, 146)");
		addList(c_pink, "rgb(218, 107, 245)");
		addList(c_green, "rgb(108, 240, 169)");
		str += "<br>LAB资源:<br>";
		addList(b_grey);
		addList(b_blue, "rgb(76, 167, 229)");
		addList(b_yellow, "rgb(247, 212, 146)");
		addList(b_pink, "rgb(218, 107, 245)");
		addList(b_green, "rgb(108, 240, 169)");
		addList(b_withe, "rgb(255,255,255)");
		console.log(str);

		return "Game.cpu.used:" + (Game.cpu.getUsed() - time)
	},
};

const HelperRoomResource = pro;

// global.HelperRoomResource = pro

const loop = errorMapper(() => {
	console.log("本轮" + Game.time + "----------------------------------------");

	mount();

	if (Game.time % 5 == 0) {
		for (let name in Memory.creeps) {
			if (!Game.creeps[name]) {
				delete Memory.creeps[name];// 清除内存
			}
		}
	}



	for (let roomName in Game.rooms) {
		setting_room_layout.run(roomName);
		// room_layout_centralization.layout(roomName)
		// let num = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {// 开启安全模式
		// 	filter: function (obj) {
		// 		return obj.structureType === STRUCTURE_EXTENSION
		// 	}
		// })
		// if (num < 15) {
		// 	Game.rooms[roomName].controller.activateSafeMode()
		// }
	}

	//tower
	// Game.getObjectById("622ed20e8792ad7fb29012ec").run_1()

	// 把查看身边的资料可否捡起来

	//todo 分布式
	let flag = Game.time % 10 == 0;

	// let roleMap
	// roleMap["harvester"] = harvester

	for (let name in Game.creeps) {
		var creep = Game.creeps[name];
		if (flag) {
			// creep.work()
		}
		if (creep.memory.role == "harvester") {
			role_harvester(creep);
		} else if (creep.memory.role == "upgrader") {
			role_upgrader(creep);
		} else if (creep.memory.role == "builder") {
			role_builder(creep);
		} else if (creep.memory.role == "carrier") {
			role_carrier(creep);
		} else if (creep.memory.role == "center") {
			roleCenter(creep);
		} else if (creep.memory.role == "defender") {
			role_defender(creep);
		} else if (creep.memory.role == "occupier") {
			role_occupier(creep);
		} else if (creep.memory.role == "repairer") {
			role_repairer(creep);
		}
	}


	console.log("tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket);
	if (Game.cpu.bucket === 10000) {
		Game.cpu.generatePixel();
	}

	global.help = HelperRoomResource;

});

//todo 更改步入第二阶段, 从container取出

exports.loop = loop;
//# sourceMappingURL=main.js.map
