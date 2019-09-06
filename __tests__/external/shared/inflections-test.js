import { Server, Model } from "@miragejs/server";
import { inflections } from "inflected";

test("I can customize the inflections", async () => {
  inflections("en", function(inflect) {
    inflect.irregular("head-of-state", "heads-of-state");
  });

  let server = new Server({
    models: {
      headOfState: Model.extend()
    }
  });

  expect(server.db._collections).toHaveLength(1);
  expect(server.db._collections[0].name).toEqual("headsOfState");

  server.shutdown();
});
