/**
 * Very simple test framework.
 */
var test = function() {
  /**
   * Indicates if tool has been already initialized or not.
   * @type {boolean}
   */
  var initialized = false;

  /**
   * Renderer must implement method 'showTestResult' which accepts three parameters:
   *  - if test passed 'true' is passed as first parameter and test's title as the second one.
   *  - if test failed 'false' is passed as first parameter, then test's title and failure reason's object.
   *
   * @type {Object}
   */
  var renderer;

  /**
   * @param {*} value Value to be checked.
   * @param {string} msg Error message.
   */
  function assert(value, msg) {
    if (value !== true) {
      throw new Error(msg);
    }
  }

  /**
   * Sends information to renderer about successful test.
   * @param {string} title Test's title.
   */
  function success(title) {
    renderer.showTestResult(true, title);
  }

  /**
   * Sends information to renderer about failed test.
   * @param {string} title Test's title.
   * @param {Object} reason Failure's reason.
   */
  function failure(title, reason) {
    renderer.showTestResult(false, title, reason);
  }

  /**
   * Returns value's type.
   * @param {*} value Input value.
   * @return {string} Value's type - one of 'primitive', 'array' or 'object'.
   */
  function type(value) {
    if (typeof value !== 'object' || value === null) {
      return 'primitive';
    }
    else if (Array.isArray(value)) {
      return 'array';
    }
    else {
      return 'object';
    }
  }

  /**
   * @param {*} a First input.
   * @param {*} b Second input.
   * @param {Array} path Search path.
   * @return {Object|true} Resulst of equality.
   */
  function areEqual_(a, b, path) {
    var i,
        res,
        aKeys,
        bKeys,
        aType = type(a),
        bType = type(b),
        len;

    if (aType !== bType) {
      return {
        type: test.T_TYPES_MISMATCH,
        where: path,
        found: aType,
        expected: bType
      };
    }

    if (type(a) === 'primitive') {
      if (a === b) {
        return true;
      }
      else {
        return {
          type: test.T_PRIMITIVES_NOT_EQUAL,
          where: path,
          found: a,
          expected: b
        };
      }
    }

    if (type(a) === 'array') {
      if (a.length !== b.length) {
        return {
          type: test.T_LENGTHS_NOT_EQUAL,
          where: path,
          found: a.length,
          expected: b.length
        };
      }

      for (i = 0; i < a.length; i++) {
        res = areEqual_(a[i], b[i], []);

        if (res !== true) {
          res.where = path.concat(i, res.where);
          return res;
        }
      }

      return true;
    }

    aKeys = Object.keys(a).sort();
    bKeys = Object.keys(b).sort();
    len = Math.max(aKeys.length, bKeys.length);

    for(i = 0; i < len; i++) {
      if(aKeys[i] !== bKeys[i]) {
        return {
          type: test.T_MISSING_PROPERTY,
          where: path,
          property: aKeys[i] < bKeys[i] ? aKeys[i] : bKeys[i]
        }
      }
    }

    for(i = 0; i < aKeys.length; i++) {
      res = areEqual_(a[aKeys[i]], b[aKeys[i]], []);

      if(res !== true) {
        res.where = path.concat(aKeys[i], res.where);
        return res;
      }
    }

    return true;
  }

  function areEqual(a, b) {
    return areEqual_(a, b, []);
  }

  return {
    T_TYPES_MISMATCH: 'types mismatch',
    T_PRIMITIVES_NOT_EQUAL: 'primitives not equal',
    T_LENGTHS_NOT_EQUAL: 'lengths not equal',
    T_MISSING_PROPERTY: 'missing property',
    T_EXTRA_PROPERTY: 'extra property',
    T_WRONG_EXCEPTION: 'wrong exception',
    T_MISSING_EXCEPTION: 'missing exception',
    /**
     * Initializer.
     * @param {Object} resultsRenderer
     */
    init: function(resultsRenderer) {
      renderer = resultsRenderer;
      initialized = true;
    },
    /**
     * Check is passed value equals (===) to true.
     * @param {string} title Test's title.
     * @param {*} found Tested value.
     */
    true: function(title, found) {
      assert(initialized, 'Not initialized');
      found === true ?
        success(title) :
        failure(title, {type: this.T_PRIMITIVES_NOT_EQUAL, found: found, expected: true});
    },
    /**
     * Check if passed values are equal.
     * @parma {string} title Test's title.
     * @param {*} found
     * @param {*} expected
     */
    eq: function(title, found, expected) {
      assert(initialized, 'Not initialized');
      var res = areEqual(found, expected);
      res === true ? success(title) : failure(title, res);
    },
    /**
     * @param {string} title Test's title.
     * @param {Function} fn Function to test.
     * @param {Function} exc Exception's constructor.
     * @param {string} excMsg Exception's message.
     */
    throws: function(title, fn, exc, excMsg) {
      assert(initialized, 'Not initialized');

      try {
        fn();
      }
      catch (e) {
        e.constructor === exc && e.message === excMsg ?
          success(title) :
          failure(title, {
            type: this.T_WRONG_EXCEPTION,
            expected: {type: exc, msg: excMsg},
            found: {type: e.constructor, msg: e.message}
          });
        return;
      }
      failure(title, {type: this.T_MISSING_EXCEPTION, expected: {type: exc, msg: excMsg}});
    }
  };
}();
