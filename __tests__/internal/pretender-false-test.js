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

test.only("handle can respond to a request", async () => {
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

// test("passthrough throws an error if Pretener is false", () => {}

// test("handleRequest works", () => {}

// test("it can create a server without Pretender", () => {
//   let server = createServer({
//     pretender: false,
//     routes() {
//       this.get("/movies", () => {
//         return {
//           movies: [
//             { id: 1, name: "Inception", year: 2010 },
//             { id: 2, name: "Interstellar", year: 2014 },
//             { id: 3, name: "Dunkirk", year: 2017 },
//           ],
//         };
//       });
//     },
//   });

//   expect(server).toBeTruthy();
//   expect(server.pretender).toBeUndefined();
// });
