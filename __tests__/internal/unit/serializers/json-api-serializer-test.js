import { JSONAPISerializer } from "@lib";

describe("Unit | Serializers | JSON API Serializer", function () {
  let serializer = null;
  beforeEach(function () {
    serializer = new JSONAPISerializer();
  });

  test("it returns coalesce Ids if present", () => {
    let request = { url: "/authors", queryParams: { "filter[id]": "1,3" } };
    expect(serializer.getCoalescedIds(request)).toEqual(["1", "3"]);
  });

  test("it returns undefined coalesce Ids if not present", () => {
    let request = { url: "/authors", queryParams: {} };
    expect(serializer.getCoalescedIds(request)).toBeUndefined();
  });
});
