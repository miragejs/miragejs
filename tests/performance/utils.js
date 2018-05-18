import { test } from 'qunit';

export function perfTest(count, message, testFn, timeout = 0) {
  test(`(${count}) ${message}`, function(assert) {
    var duration = time(() => {
      testFn(count);
    });

    if (timeout) {
      assert.ok(duration < timeout, `${duration}ms (${timeout}ms timeout)`);
    } else {
      assert.ok(true, `${duration}ms`);
    }
  });
}

export function time(fn) {
  var start = now();
  fn();

  return now() - start;
}

export function now() {
  return performance
    ? performance.now()
    : Date.now
      ? Date.now()
      : +new Date();
}
