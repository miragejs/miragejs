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

interface IMovie {
  title: string;
}

interface IContact {
  name: string;
  phone: number;
}

server.db.loadData<IMovie>({
  movies: [
    { title: "Interstellar" },
    { title: "Inception" },
    { title: "Dunkirk" }
  ]
});
server.db.loadData<IContact>({
  contacts: [{ name: "Joe", phone: 1234 }, { name: "Bill", phone: 2345 }]
});
server.db.dump();
server.db.emptyData();
server.db.createCollection("movies");

const allMovies = server.db.movies;
const firstMovie = server.db.movies[0];

const allContacts = server.db.contacts;

server.db.movies.insert({ title: "The Lord of the Rings" });

const server2 = new Server({
  // tslint:disable-next-line:no-shadowed-variable
  seeds(server) {
    server.db.loadData({
      movies: [
        { title: "Interstellar" },
        { title: "Inception" },
        { title: "Dunkirk" }
      ]
    });
  },

  routes() {
    this.get("/movies", (schema, request) => {
      return schema.db.movies;
    });

    this.post("/movies", (schema, request) => {
      const attrs = JSON.parse(request.requestBody);

      return schema.db.movies.insert(attrs);
    });
  }
});
