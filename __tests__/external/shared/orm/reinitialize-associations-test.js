import { Server, Model, hasMany } from "miragejs";

describe("External | Shared | ORM | reinitialize associations", () => {
  // Model classes are defined statically, just like in a typical app
  let User = Model.extend({
    addresses: hasMany(),
  });
  let Address = Model.extend();

  test("Model classes can be reused with multiple servers", () => {
    let config = {
      environment: "test",
      models: {
        address: Address,
        user: User,
      },
    };

    let server1 = new Server(config);

    server1.schema.addresses.create({ id: 1, country: "Hyrule" });
    server1.schema.users.create({ id: 1, name: "Link", addressIds: [1] });

    expect(server1.schema.users.find(1).addresses.models[0].country).toBe(
      "Hyrule"
    );

    server1.shutdown();

    let server2 = new Server(config);

    server2.schema.addresses.create({ id: 1, country: "Hyrule" });
    server2.schema.users.create({ id: 1, name: "Link", addressIds: [1] });

    expect(server2.schema.users.find(1).addresses.models[0].country).toBe(
      "Hyrule"
    );

    server2.shutdown();
  });
});
