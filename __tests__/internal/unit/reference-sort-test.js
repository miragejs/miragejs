import { _utilsReferenceSort as referenceSort } from "@lib";

describe("mirage:reference-sort", function () {
  test("it sorts property references", () => {
    let sorted = referenceSort([
      ["propA"],
      ["propB", "propC"],
      ["propC", "propA"],
      ["propD"],
    ]);

    expect(sorted).toEqual(["propD", "propA", "propC", "propB"]);
  });

  test("it throws on circular dependency", () => {
    expect(function () {
      referenceSort([
        ["propA", "propB"],
        ["propB", "propA"],
      ]);
    }).toThrow('Cyclic dependency in properties ["propB","propA"]');
  });

  test("it works with no references", () => {
    let sorted = referenceSort([["propA"], ["propB"], ["propC"], ["propD"]]);

    expect(sorted).toEqual(["propD", "propC", "propB", "propA"]);
  });
});
