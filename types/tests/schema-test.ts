import { Factory, Model, Registry } from "miragejs";
import Schema from "miragejs/orm/schema";

const FooModel = Model.extend({
  attr: "text",
});

const FooFactory = Factory.extend({
  attr: "text",
});

declare const schema: Schema<Registry<
  { foo: typeof FooModel },
  { foo: typeof FooFactory }
>>;

schema.create("foo").attr; // $ExpectType string
schema.create("foo", { attr: "ok" }).attr; // $ExpectType string
schema.create("foo", { attr: 123 }); // $ExpectError
schema.create("foo", { x: true }); // $ExpectError
schema.create("cow"); // $ExpectError

schema.find("foo", "123"); // $ExpectType ModelInstance<FlattenRelationships<Assign<{}, { attr: string; }>> & FlattenFactoryMethods<Assign<{}, { attr: string; }>>> | null
schema.find("foo", ["123"]).models[0]; // $ExpectType ModelInstance<FlattenRelationships<Assign<{}, { attr: string; }>> & FlattenFactoryMethods<Assign<{}, { attr: string; }>>>
schema.find("cow", "123"); // $ExpectError

schema.findOrCreateBy("foo", { attr: "hi" }); // $ExpectType ModelInstance<FlattenRelationships<Assign<{}, { attr: string; }>> & FlattenFactoryMethods<Assign<{}, { attr: string; }>>>
schema.findOrCreateBy("foo", { bar: true }); // $ExpectError
schema.findOrCreateBy("cow", { attr: "bar" }); // $ExpectError

schema.where("foo", { attr: "bar" }); // $ExpectType Collection<ModelInstance<FlattenRelationships<Assign<{}, { attr: string; }>> & FlattenFactoryMethods<Assign<{}, { attr: string; }>>>>
schema.where("foo", { bar: true }); // $ExpectError
schema.where("foo", (foo) => foo.attr === "ok"); // $ExpectType Collection<ModelInstance<FlattenRelationships<Assign<{}, { attr: string; }>> & FlattenFactoryMethods<Assign<{}, { attr: string; }>>>>
schema.where("foo", (foo) => foo.x === "ok"); // $ExpectError
schema.where("cow", { attr: "bar" }); // $ExpectError

schema.all("foo"); // $ExpectType Collection<ModelInstance<FlattenRelationships<Assign<{}, { attr: string; }>> & FlattenFactoryMethods<Assign<{}, { attr: string; }>>>>
schema.all("cow"); // $ExpectError

schema.none("foo"); // $ExpectType Collection<ModelInstance<FlattenRelationships<Assign<{}, { attr: string; }>> & FlattenFactoryMethods<Assign<{}, { attr: string; }>>>>
schema.none("cow"); // $ExpectError

schema.first("foo"); // $ExpectType ModelInstance<FlattenRelationships<Assign<{}, { attr: string; }>> & FlattenFactoryMethods<Assign<{}, { attr: string; }>>> | null
schema.first("cow"); // $ExpectError
