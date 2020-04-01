import { Server, Model, Factory } from "miragejs";

describe("Internal | Integration | Performance | Simple factory test", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        car: Model,
      },
      factories: {
        car: Factory.extend({
          make: "Fjord",
          model: "Wagon",
          year: "1886",
        }),
      },
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
  });

  const carMaker = (count) => {
    server.createList("car", count);
  };

  perfTest(50, "models", carMaker);
  perfTest(500, "models", carMaker);
  perfTest(5000, "models", carMaker);
});

function perfTest(count, message, testFn, timeout = 0) {
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

function time(fn) {
  let start = now();
  fn();

  return now() - start;
}

function now() {
  return Date.now ? Date.now() : +new Date();
}
