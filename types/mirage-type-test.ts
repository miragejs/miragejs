import { Server } from "./index";

let server: Server;

server = new Server({
  baseConfig() {
    this.timing = 400;
    this.urlPrefix = "http://localhost:8080";
  },
  testConfig() {
    this.namespace = "/test-api";
  },
  routes() {
    this.namespace = "/api";

    this.get("/movies", () => {
      return {
        movies: [
          { id: 1, name: "Inception", year: 2010 },
          { id: 2, name: "Interstellar", year: 2014 },
          { id: 3, name: "Dunkirk", year: 2017 }
        ]
      };
    });
    this.get("/contacts", "contacts");
    this.post("/movies", () => 201);
    this.put("/movies", "movies");
    this.del("/movies/1");

    this.pretender.handledRequest = (verb, path, request) => {
      const { responseText } = request;
      // log request and response data
    };
  }
});
