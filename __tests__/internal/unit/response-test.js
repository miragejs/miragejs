import { Response } from "@lib";

describe("Unit | Response", function () {
  test("it can be instantiated and return a rack response", () => {
    let response = new Response(404, {}, {});

    expect(response).toBeTruthy();
    expect(response.toRackResponse()).toBeTruthy();
  });

  test("it can be instantiated with just a response code", () => {
    let response = new Response(404);

    expect(response).toBeTruthy();
    expect(response.toRackResponse()).toBeTruthy();
  });

  test("it adds Content-Type by default", () => {
    let response = new Response(200, {}, {});

    expect(response).toBeTruthy();
    expect(response.headers["Content-Type"]).toBe("application/json");
  });

  test("it does not add Content-Type for a 204 response", () => {
    let response = new Response(204);

    expect(response).toBeTruthy();
    expect(response.headers["Content-Type"]).toBeFalsy();
  });
});
