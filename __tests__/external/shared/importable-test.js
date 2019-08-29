import { Server } from "@miragejs/server";

test("Server is importable in node", async () => {
  expect(Server).toBeTruthy();
});
