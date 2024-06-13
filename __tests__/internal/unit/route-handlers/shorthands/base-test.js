import { _routeHandlersShorthandsBase as BaseShorthandRouteHandler } from "@lib";

describe("Unit | Route handlers | Shorthands | BaseShorthandRouteHandler", function () {
  let handler = null;
  let request = null;
  beforeEach(function () {
    handler = new BaseShorthandRouteHandler();
    request = { params: { id: "" } };
  });

  test("it returns a number if it's a number", () => {
    request.params.id = 2;
    expect(handler._getIdForRequest(request)).toBe(2);
  });

  test("it returns a number if it's a string represented number", () => {
    request.params.id = "2";
    expect(handler._getIdForRequest(request)).toBe("2");
  });

  test("it returns a string it's a dasherized number", () => {
    request.params.id = "2-1";
    expect(handler._getIdForRequest(request)).toBe("2-1");
  });

  test("it returns a string if it's a string", () => {
    request.params.id = "someID";
    expect(handler._getIdForRequest(request)).toBe("someID");
  });

  test("getModelClassFromPath works with various named route path variable", () => {
    let urlWithSlash = "/api/fancy-users";
    let urlWithIdAndSlash = "/api/fancy-users/:id";
    let urlWithTrailingSlash = "/api/fancy-users/";

    expect(handler.getModelClassFromPath(urlWithSlash)).toBe("fancy-user");
    expect(handler.getModelClassFromPath(urlWithIdAndSlash, true)).toBe(
      "fancy-user"
    );
    expect(handler.getModelClassFromPath(urlWithTrailingSlash)).toBe(
      "fancy-user"
    );

    urlWithSlash = "/api/exquisite-users";
    urlWithIdAndSlash = "/api/exquisite-users/:objectId";

    expect(handler.getModelClassFromPath(urlWithSlash)).toBe("exquisite-user");
    expect(handler.getModelClassFromPath(urlWithIdAndSlash, true)).toBe(
      "exquisite-user"
    );

    urlWithSlash = "/api/elegant-users";
    urlWithIdAndSlash = "/api/elegant-users/:firstName/:lastName";

    expect(handler.getModelClassFromPath(urlWithSlash)).toBe("elegant-user");
    expect(handler.getModelClassFromPath(urlWithIdAndSlash, true)).toBe(
      "elegant-user"
    );
  });

  test("it can read the id from the url", () => {
    let request = { params: { id: "test-id" } };
    expect(handler._getIdForRequest(request)).toBe("test-id");
  });

  test("it can read the id from the request body", () => {
    let request = { params: {} };
    let jsonApiDoc = { data: { id: "jsonapi-id" } };
    expect(handler._getIdForRequest(request, jsonApiDoc)).toBe("jsonapi-id");
  });
});
