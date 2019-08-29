import { Server, Model, Factory } from "@miragejs/server";
import { perfTest } from "./utils";

describe("Performance | Factory | Simple", () => {
  let server;

  beforeEach(() => {
    server = new Server({
      environment: "test",
      models: {
        car: Model
      },
      factories: {
        car: Factory.extend({
          make: "Fjord",
          model: "Wagon",
          year: "1886"
        })
      }
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
  });

  const carMaker = count => {
    server.createList("car", count);
  };

  perfTest(50, "models", carMaker);
  perfTest(500, "models", carMaker);
  perfTest(5000, "models", carMaker);
});
