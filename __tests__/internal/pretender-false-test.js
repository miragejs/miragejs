import { createServer } from "miragejs";

test("it can create a server without Pretender", () => {
  let server = createServer({
    pretender: false,
  });

  expect(server).toBeTruthy();
  expect(server.pretender).toBeUndefined();
});

test("handleRequest returns a 404 when there is no matching handler", () => {
  let server = createServer({
    pretender: false,
  });

  expect(
    server.handle({
      verb: "GET",
      url: "/movies",
    })
  ).toEqual({
    code: 404,
    headers: {},
    body: "",
  });
});

test("handle responds to a GET request", async () => {
  let server = createServer({
    pretender: false,
    routes() {
      this.get("/movies", () => {
        return {
          movies: [
            { id: 1, name: "Inception", year: 2010 },
            { id: 2, name: "Interstellar", year: 2014 },
            { id: 3, name: "Dunkirk", year: 2017 },
          ],
        };
      });
    },
  });

  let res = await server.handle({
    verb: "GET",
    url: "/movies",
  });

  expect(res).toEqual({
    code: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: `{"movies":[{"id":1,"name":"Inception","year":2010},{"id":2,"name":"Interstellar","year":2014},{"id":3,"name":"Dunkirk","year":2017}]}`,
    json: {
      movies: [
        { id: 1, name: "Inception", year: 2010 },
        { id: 2, name: "Interstellar", year: 2014 },
        { id: 3, name: "Dunkirk", year: 2017 },
      ],
    },
  });
});

test.only("handle responds to a POST request", async () => {
  let server = createServer({
    pretender: false,
    routes() {
      this.post("/foo", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);

        return {
          dataFromRequestBody: attrs,
        };
      });
    },
  });

  let res = await server.handle({
    verb: "POST",
    url: "/foo",
    body: JSON.stringify({ some: "data" }),
  });

  let expectedResponseJson = { dataFromRequestBody: { some: "data" } };

  expect(res).toEqual({
    code: 201,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expectedResponseJson),
    json: expectedResponseJson,
  });
});

// test("POST", () => {}
// test("PATCH", () => {}
// test("DELETE", () => {}
// test("namespace", () => {}
// test("origin / urlPrefix", () => {}
// test("dynamic segment", () => {}
// test("wildcard match", () => {}
// test("handler throws error", () => {}

// test("passing headers to request", () => {}

// test("verb must be one of GET/POST/PUT/PATCH/OPTIONS", () => {}

// test("non json response", () => {}

// test("passthrough throws an error if Pretener is false", () => {}
