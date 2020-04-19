import {
  _ormSchema as Schema,
  _Db as Db,
  Model,
  belongsTo,
  ActiveModelSerializer,
} from "@lib";

describe("Unit | Serializers | ActiveModelSerializer", function () {
  let serializer = null;
  let schema = null;

  beforeEach(function () {
    schema = new Schema(new Db(), {
      contact: Model.extend({
        address: belongsTo(),
      }),
      address: Model.extend({
        contact: belongsTo(),
      }),
    });
    serializer = new ActiveModelSerializer({
      schema,
    });
  });

  test("normalize works", () => {
    let payload = {
      contact: {
        id: 1,
        name: "Link",
      },
    };
    let jsonApiDoc = serializer.normalize(payload);

    expect(jsonApiDoc).toEqual({
      data: {
        type: "contacts",
        id: 1,
        attributes: {
          name: "Link",
        },
      },
    });
  });

  test("normalize primaryKey Works", () => {
    let payload = {
      contact: {
        contactId: 1,
        name: "Link",
      },
    };

    serializer.primaryKey = "contactId";

    let jsonApiDoc = serializer.normalize(payload);

    expect(jsonApiDoc).toEqual({
      data: {
        type: "contacts",
        id: 1,
        attributes: {
          name: "Link",
        },
      },
    });
  });

  test("it hyphenates snake_cased words", () => {
    let payload = {
      contact: {
        id: 1,
        first_name: "Link",
      },
    };
    let jsonApiDoc = serializer.normalize(payload);

    expect(jsonApiDoc).toEqual({
      data: {
        type: "contacts",
        id: 1,
        attributes: {
          "first-name": "Link",
        },
      },
    });
  });

  test("it works without an id", () => {
    let payload = {
      contact: {
        first_name: "Link",
        last_name: "zor",
      },
    };
    let jsonApiDoc = serializer.normalize(payload);

    expect(jsonApiDoc).toEqual({
      data: {
        type: "contacts",
        attributes: {
          "first-name": "Link",
          "last-name": "zor",
        },
      },
    });
  });

  test("it returns coalesce Ids if present", () => {
    let request = { url: "/authors", queryParams: { ids: ["1", "3"] } };
    expect(serializer.getCoalescedIds(request)).toEqual(["1", "3"]);
  });

  test("it returns undefined coalesce Ids if not present", () => {
    let request = { url: "/authors", queryParams: {} };
    expect(serializer.getCoalescedIds(request)).toBeUndefined();
  });

  test("normalizeIds defaults to true", () => {
    let serializer = new ActiveModelSerializer();

    expect(serializer.normalizeIds).toEqual(true);
  });

  test("normalize works with normalizeIds set to true", () => {
    serializer.normalizeIds = true;
    let payload = {
      contact: {
        id: 1,
        name: "Link",
        address: 1,
      },
    };
    let jsonApiDoc = serializer.normalize(payload);

    expect(jsonApiDoc).toEqual({
      data: {
        type: "contacts",
        id: 1,
        attributes: {
          name: "Link",
        },
        relationships: {
          address: {
            data: {
              type: "address",
              id: 1,
            },
          },
        },
      },
    });
  });

  test('serializeIds defaults to "always"', () => {
    let defaultState = new ActiveModelSerializer();
    expect(defaultState.serializeIds).toEqual("always");
  });
});
