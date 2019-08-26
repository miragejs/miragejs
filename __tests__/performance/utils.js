export function perfTest(count, message, testFn, timeout = 0) {
  test(`(${count}) ${message}`, () => {
    let duration = time(() => {
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
  let start = now();
  fn();

  return now() - start;
}

export function now() {
  return Date.now ? Date.now() : +new Date();
}
