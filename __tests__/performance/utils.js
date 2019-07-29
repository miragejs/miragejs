export function perfTest(count, message, testFn, timeout = 0) {
  test(`(${count}) ${message}`, () => {
    var duration = time(() => {
      testFn(count);
    });

    if (timeout) {
      expect(duration).toBeLessThan(timeout);
    } else {
      expect(`${duration}ms`).toBeTruthy();
    }
  });
}

export function time(fn) {
  var start = now();
  fn();

  return now() - start;
}

export function now() {
  return performance ? performance.now() : Date.now ? Date.now() : +new Date();
}
