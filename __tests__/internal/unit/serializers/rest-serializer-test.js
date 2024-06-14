import { _ormSchema as Schema, _Db as Db, Model, RestSerializer } from "@lib";

describe("Unit | Serializers | RestSerializer", function () {
  let schema = null;
  let serializer = null;
  beforeEach(function () {
    schema = new Schema(new Db(), {
      person: Model,
    });
    serializer = new RestSerializer({
      schema,
    });
  });

  test("it hyphenates camelized words", () => {
    let payload = {
      person: {
        id: 1,
        firstName: "Rick",
        lastName: "Sanchez",
      },
    };
    let jsonApiDoc = serializer.normalize(payload);

    expect(jsonApiDoc).toEqual({
      data: {
        type: "people",
        id: 1,
        attributes: {
          "first-name": "Rick",
          "last-name": "Sanchez",
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
});

test('serializeIds defaults to "always"', () => {
  let defaultState = new RestSerializer();
  expect(defaultState.serializeIds).toBe("always");
});
