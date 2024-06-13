import { Server, Model, ActiveModelSerializer } from "miragejs";

describe("Integration | Route handlers | Function handler | #normalizedRequestAttrs", () => {
  let server;
  beforeEach(() => {
    server = new Server({
      environment: "development",
      models: {
        user: Model.extend({}),
        fineComment: Model.extend({}),
      },
      serializers: {
        application: ActiveModelSerializer,
      },
    });
    server.timing = 0;
    server.logging = false;
  });

  afterEach(() => {
    server.shutdown();
  });

  test(`it returns an object with the primary resource's attrs and belongsTo keys camelized`, async () => {
    expect.assertions(1);

    server.post("/users", function () {
      let attrs = this.normalizedRequestAttrs();

      expect(attrs).toEqual({
        firstName: "Sam",
        lastName: "Selikoff",
        teamId: 1,
      });

      return {};
    });

    await fetch("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          first_name: "Sam",
          last_name: "Selikoff",
          team_id: 1,
        },
      }),
    });
  });

  test(`it works for compound names`, async () => {
    expect.assertions(1);

    server.post("/fine-comments", function () {
      let attrs = this.normalizedRequestAttrs();

      expect(attrs).toEqual({
        shortText: "lorem ipsum",
      });

      return {};
    });

    await fetch("/fine-comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fine_comment: {
          short_text: "lorem ipsum",
        },
      }),
    });
  });

  test(`it shows a meaningful error message if it cannot infer the modelname from the URL`, async () => {
    expect.assertions(2);

    server.post("/users/create", function () {
      this.normalizedRequestAttrs();
    });

    let res = await fetch("/users/create", { method: "POST" });
    let data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toMatch(
      "the detected model of 'create' does not exist"
    );
  });

  test(`it accepts an optional modelName if it cannot be inferred from the path`, async () => {
    expect.assertions(1);

    server.post("/users/create", function () {
      let attrs = this.normalizedRequestAttrs("user");

      expect(attrs).toEqual({
        firstName: "Sam",
        lastName: "Selikoff",
        teamId: 1,
      });

      return {};
    });

    await fetch("/users/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          first_name: "Sam",
          last_name: "Selikoff",
          team_id: 1,
        },
      }),
    });
  });

  test(`it errors if the optional parameter is camelized for a model with a compount name`, async () => {
    expect.assertions(2);

    server.post("/fine-comments/create", function () {
      this.normalizedRequestAttrs("fineComment");
    });

    let res = await fetch("/fine-comments/create", { method: "POST" });
    let data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toMatch(
      "You called normalizedRequestAttrs('fineComment'), but normalizedRequestAttrs was intended to be used with the dasherized version of the model type. Please change this to normalizedRequestAttrs('fine-comment')"
    );
  });

  test(`it works with a form encoded request that has a lower-case content-type (issue 1398)`, async () => {
    expect.assertions(1);

    server.post("/form-test", function () {
      let attrs = this.normalizedRequestAttrs("user");

      expect(attrs).toEqual({
        name: "Sam Selikoff",
        company: "TED",
        email: "sam.selikoff@gmail.com",
      });

      return {};
    });

    await fetch("/form-test", {
      method: "POST",
      headers: {
        "content-type": "x-www-form-urlencoded",
      },
      body: "name=Sam+Selikoff&company=TED&email=sam.selikoff@gmail.com",
    });
  });
});
