import { Server } from "./index";

let server: Server;

server = new Server({
  baseConfig() {
    this.timing = 400;
    this.urlPrefix = "http://localhost:8080";
  },
  routes() {
    this.namespace = "api";

    this.get("/movies", () => {
      return {
        movies: [
          { id: 1, name: "Inception", year: 2010 },
          { id: 2, name: "Interstellar", year: 2014 },
          { id: 3, name: "Dunkirk", year: 2017 }
        ]
      };
    });
  }
});

server = new Server({
  baseConfig() {
    this.pretender.handledRequest = (verb, path, request) => {
      const { responseText } = request;
      // log request and response data
    };
  }
});

server = new Server({
  baseConfig() {
    this.namespace = "/api";

    // this route will handle the URL '/api/contacts'
    this.get("/contacts", "contacts");
  }
});

server = new Server({
  baseConfig() {
    // normal config, shared across development + testing
  },

  testConfig() {
    // test-only config, does not apply to development
  }
});
