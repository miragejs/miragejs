import "../../lib/container";
import IdentityManager from "../../lib/identity-manager";

describe("Unit | Db | IdentityManager", function() {
  test("it can be instantiated", () => {
    let manager = new IdentityManager();
    expect(manager).toBeTruthy();
  });

  test(`fetch returns the latest number`, () => {
    let manager = new IdentityManager();

    expect(manager.fetch()).toEqual("1");
    expect(manager.fetch()).toEqual("2");
    expect(manager.fetch()).toEqual("3");
  });

  test(`get returns the upcoming id used for fetch`, () => {
    let manager = new IdentityManager();

    expect(manager.fetch()).toEqual("1");
    expect(manager.get()).toEqual(2);
    expect(manager.fetch()).toEqual("2");
  });

  test(`set indicates an id is being used`, () => {
    let manager = new IdentityManager();
    manager.set("abc");

    expect(function() {
      manager.set("abc");
    }).toThrow();
  });

  test(`a numerical value passed into set affects future ids used by fetch`, () => {
    let manager = new IdentityManager();
    manager.set(5);

    expect(manager.fetch()).toEqual("6");
    expect(manager.fetch()).toEqual("7");
  });

  test(`multiple numerical values passed into set affects future ids used by fetch`, () => {
    let manager = new IdentityManager();
    manager.set(5);
    manager.set(6);

    expect(manager.fetch()).toEqual("7");
    expect(manager.fetch()).toEqual("8");
  });

  test(`an int as a string passed into set affects future ids used by fetch`, () => {
    let manager = new IdentityManager();
    manager.set("5");

    expect(manager.fetch()).toEqual("6");
    expect(manager.fetch()).toEqual("7");
  });

  test(`multiple ints as a string passed into set affects future ids used by fetch`, () => {
    let manager = new IdentityManager();
    manager.set("5");
    manager.set("6");

    expect(manager.fetch()).toEqual("7");
    expect(manager.fetch()).toEqual("8");
  });

  test(`a string value that doesn't parse as an int passed into set doesn't affect future ids used by fetch`, () => {
    let manager = new IdentityManager();
    manager.set("123-abc");

    expect(manager.fetch()).toEqual("1");
    expect(manager.fetch()).toEqual("2");
  });

  test(`reset clears the managers memory`, () => {
    let manager = new IdentityManager();
    manager.set("abc");
    manager.reset();
    manager.set("abc");

    expect(true).toBeTruthy();
  });
});
