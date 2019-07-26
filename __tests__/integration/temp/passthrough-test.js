import Server from "ember-cli-mirage/server";
import promiseAjax from "../helpers/promise-ajax";

describe("Integration | Passthrough", () => {
  let server;
  beforeEach(() => {
    server = new Server({
      environment: "development"
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(function() {
    server.shutdown();
  });

  test("it can passthrough individual paths", () => {
    expect.assertions(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough("/addresses");
    });

    promiseAjax({
      method: "GET",
      url: "/contacts"
    }).then(response => {
      expect(response.data).toEqual(123);
      done1();
    });

    promiseAjax({
      method: "GET",
      url: "/addresses"
    }).catch(error => {
      expect(error.xhr.status).toEqual(404);
      done2();
    });
  });

  test("it can passthrough certain verbs for individual paths", () => {
    assert.expect(3);
    let done1 = assert.async();
    let done2 = assert.async();
    let done3 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough("/addresses", ["post"]);
    });
    server.pretender.unhandledRequest = function(/* verb, path */) {
      expect(true).toBeTruthy();
      done2();
    };

    promiseAjax({
      method: "GET",
      url: "/contacts"
    }).then(response => {
      expect(response.data).toEqual(123);
      done1();
    });

    promiseAjax({
      method: "GET",
      url: "/addresses"
    });

    promiseAjax({
      method: "POST",
      url: "/addresses"
    }).catch(error => {
      expect(error.xhr.status).toEqual(404);
      done3();
    });
  });

  test("it can passthrough all verbs by default", () => {
    let verbs = ["GET", "HEAD", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"];
    assert.expect(verbs.length);

    let done = verbs.map(() => assert.async());
    let { server } = this;

    server.loadConfig(function() {
      this.passthrough("/addresses");
    });

    verbs.forEach((verb, index) => {
      promiseAjax({
        method: verb,
        url: "/addresses"
      }).catch(error => {
        expect(error.xhr.status).toEqual(404);
        done[index]();
      });
    });
  });

  test("it can passthrough multiple paths in a single call", () => {
    expect.assertions(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough("/contacts", "/addresses");
    });

    promiseAjax({
      method: "GET",
      url: "/contacts"
    }).catch(error => {
      expect(error.xhr.status).toEqual(404);
      done1();
    });

    promiseAjax({
      method: "POST",
      url: "/addresses"
    }).catch(error => {
      expect(error.xhr.status).toEqual(404);
      done2();
    });
  });

  test("user can call passthrough multiple times", () => {
    expect.assertions(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.passthrough("/contacts");
      this.passthrough("/addresses", ["post"]);
    });

    promiseAjax({
      method: "GET",
      url: "/contacts"
    }).catch(error => {
      expect(error.xhr.status).toEqual(404);
      done1();
    });

    promiseAjax({
      method: "POST",
      url: "/addresses"
    }).catch(error => {
      expect(error.xhr.status).toEqual(404);
      done2();
    });
  });

  test("passthrough without args allows all paths on the current domain to passthrough", () => {
    expect.assertions(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough();
    });

    promiseAjax({
      method: "GET",
      url: "/contacts"
    }).then(response => {
      expect(response.data).toEqual(123);
      done1();
    });

    promiseAjax({
      method: "GET",
      url: "/addresses"
    }).catch(error => {
      expect(error.xhr.status).toEqual(404);
      done2();
    });
  });

  test("passthrough without args allows index route on current domain to passthrough", () => {
    expect.assertions(2);
    let done1 = assert.async();
    let done2 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.get("/contacts", function() {
        return 123;
      });
      this.passthrough();
    });

    promiseAjax({
      method: "GET",
      url: "/contacts"
    }).then(response => {
      expect(response.data).toEqual(123);
      done1(); // test will fail bc only 1 assertion, but we don't have to wait
    });

    promiseAjax({
      method: "GET",
      url: "/"
    })
      .then(response => {
        // a passthrough request to index on the current domain
        // actually succeeds here, since that's where the test runner is served
        expect(response.data).toBeTruthy();
        done2();
      })
      .catch(() => {
        done2(); // test will fail bc only 1 assertion, but we don't have to wait
      });
  });

  test("it can passthrough other-origin hosts", () => {
    assert.expect(1);
    let done1 = assert.async();
    let { server } = this;

    server.loadConfig(function() {
      this.passthrough("http://api.foo.bar/**");
    });

    promiseAjax({
      method: "GET",
      url: "/addresses"
    }).catch(error => {
      expect(true).toBeTruthy();
      done1();
    });
  });
});
