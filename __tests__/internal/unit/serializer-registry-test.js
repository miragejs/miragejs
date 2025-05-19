import {
  JSONAPISerializer,
  Model,
  RestSerializer,
  Schema,
  SerializerRegistry,
} from "@lib";

const models = {
  user: Model,
  post: Model,
};

describe("Unit | SerializerRegistry #serialize", () => {
  let registry;
  let schema;

  beforeEach(() => {
    schema = new Schema({ models });
    registry = new SerializerRegistry(schema, {
      application: RestSerializer,
    });
  });

  describe("single model", () => {
    it("serializes a single model", () => {
      const user = schema.create("user", { id: 1, name: "John" });
      const result = registry.serialize(user);

      expect(result).toEqual({
        user: { id: "1", name: "John" },
      });
    });
  });

  describe("single collection", () => {
    it("serializes a single collection", () => {
      schema.create("user", { id: 1, name: "John" });
      schema.create("user", { id: 2, name: "Jane" });
      const users = schema.all("user");
      const result = registry.serialize(users);

      expect(result).toEqual({
        users: [
          { id: "1", name: "John" },
          { id: "2", name: "Jane" },
        ],
      });
    });
  });

  describe("array of models", () => {
    it("passes through an array of models", () => {
      const users = [
        schema.create("user", { id: 1, name: "John" }),
        schema.create("user", { id: 2, name: "Jane" }),
      ];
      const result = registry.serialize(users);

      expect(result).toEqual(users);
    });
  });

  describe("array of collections", () => {
    it("serializes an array of collections", () => {
      schema.create("user", { id: 1, name: "John" });
      schema.create("user", { id: 2, name: "Jane" });
      schema.create("post", { id: 1, title: "Hello" });
      schema.create("post", { id: 2, title: "World" });

      const users = schema.all("user");
      const posts = schema.all("post");
      const result = registry.serialize([users, posts]);

      expect(result).toEqual({
        users: [
          { id: "1", name: "John" },
          { id: "2", name: "Jane" },
        ],
        posts: [
          { id: "1", title: "Hello" },
          { id: "2", title: "World" },
        ],
      });
    });

    it("handles empty array of collections", () => {
      const result = registry.serialize([]);
      expect(result).toEqual([]);
    });

    it("handles array with mixed collections and models", () => {
      schema.create("user", { id: 1, name: "John" });
      const users = schema.all("user");
      const post = schema.create("post", { id: 1, title: "Hello" });
      const result = registry.serialize([users, post]);

      // Should pass through as raw data
      expect(result).toEqual([users, post]);
    });
  });

  describe("raw data", () => {
    it("passes through raw data", () => {
      const data = { foo: "bar" };
      const result = registry.serialize(data);
      expect(result).toEqual(data);
    });

    it("passes through array of raw data", () => {
      const data = [{ foo: "bar" }, { baz: "qux" }];
      const result = registry.serialize(data);
      expect(result).toEqual(data);
    });
  });

  describe("with different serializers", () => {
    it("uses model-specific serializer when available", () => {
      registry = new SerializerRegistry(schema, {
        application: RestSerializer,
        user: JSONAPISerializer.extend({
          attributes: ["name"],
        }),
      });

      const user = schema.create("user", {
        id: 1,
        name: "John",
        email: "john@example.com",
      });
      const result = registry.serialize(user);

      expect(result).toEqual({
        data: {
          type: "users",
          id: "1",
          attributes: {
            name: "John",
            email: "john@example.com",
          },
        },
      });
    });

    it("falls back to application serializer when model-specific serializer is not available", () => {
      registry = new SerializerRegistry(schema, {
        application: RestSerializer,
        user: JSONAPISerializer,
      });

      const post = schema.create("post", { id: 1, title: "Hello" });
      const result = registry.serialize(post);

      expect(result).toEqual({
        post: { id: "1", title: "Hello" },
      });
    });
  });
});
