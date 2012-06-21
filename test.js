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
   * Send information to renderer about successful test.
   * @param {string} title Test's title.
   */
  function success(title) {
    renderer.showTestResult(true, title);
  }

  /**
   * Send information to renderer about failed test.
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
   * @param {*} found
   * @param {*} expected
   * @param {Array} where
   * @return {Object|true}
   */
  function areEqual_(found, expected, where) {
    var foundType = type(found),
        expectedType = type(expected),
        i;

    if (foundType !== expectedType) {
      return {
        type: test.T_TYPES_MISMATCH,
        where: where,
        found: foundType,
        expected: expectedType
      };
    }

    if (foundType === 'primitive') {
      return found === expected ?
        true :
        {
          type: test.T_PRIMITIVES_NOT_EQUAL,
          where: where,
          found: found,
          expected: expected
        };
    }

    if (foundType === 'array') {
      if (found.length !== expected.length) {
        return {
          type: test.T_LENGTHS_NOT_EQUAL,
          where: where,
          found: found.length,
          expected: expected.length
        };
      }

      for (i = 0; i < found.length; i++) {
        res = areEqual_(found[i], expected[i], []);

        if (res !== true) {
          res.where = where.concat(i, res.where);
          return res;
        }
      }

      return true;
    }

    var foundKeys = Object.keys(found).sort(),
        expectedKeys = Object.keys(expected).sort(),
        foundKey,
        expectedKey,
        max = Math.max(foundKeys.length, expectedKeys.length);

    for(i = 0; i < max; i++) {
      foundKey = foundKeys[i];
      expectedKey = expectedKeys[i];

      if(foundKey !== expectedKey) {
        res = foundKey === undefined || foundKey > expectedKey

        return {
          type: res ? test.T_MISSING_PROPERTY : test.T_EXTRA_PROPERTY,
          property: res ? expectedKey : foundKey,
          where: where
        };
      }
    }

    for(i = 0; i < foundKeys.length; i++) {
      foundKey = foundKeys[i];
      res = areEqual_(found[foundKey], expected[foundKey], []);

      if(res !== true) {
        res.where = where.concat(foundKey, res.where);
        return res;
      }
    }

    return true;
  }

  /**
   * Check if passed values are equal.
   * @param {*} expected
   * @param {*} found
   * @return {boolean|Object}
   */
  function areEqual(expected, found) {
    return areEqual_(expected, found, []);
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
     * Check if passed value equals (===) to true.
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
