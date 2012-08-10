
/**
 * Test render put everything to console.
 * @constructor
 */
test.ConsoleTestRenderer = function() {
};
test.inherits(test.ConsoleTestRenderer, test.TestRenderer);

/**
 * @inheritDoc
 */
test.ConsoleTestRenderer.prototype.showTestResult = function(success, title, reason) {
  console.info(success ? 'success' : 'failure', '\t', title, success ? '' : reason);
};
