import { expectType, expectError } from "tsd";
import { Factory, Model, Registry } from "miragejs";
import Schema from "miragejs/orm/schema";

const FooModel = Model.extend({
  attr: "text",
});

const FooFactory = Factory.extend({
  attr: "text",
});

declare const schema: Schema<
  Registry<{ foo: typeof FooModel }, { foo: typeof FooFactory }>
>;

expectType<string>(schema.create("foo").attr);
expectType<string>(schema.create("foo", { attr: "ok" }).attr);
expectError(schema.create("foo", { attr: 123 }));
expectError(schema.create("foo", { x: true }));
expectError(schema.create("cow"));

expectType<string | undefined>(schema.find("foo", "123")?.attr);
expectType<string>(schema.find("foo", ["123"]).models[0].attr);
expectError(schema.find("cow", "123"));

expectType<string>(schema.findOrCreateBy("foo", { attr: "hi" }).attr);
expectError(schema.findOrCreateBy("foo", { bar: true }));
expectError(schema.findOrCreateBy("cow", { attr: "bar" }));

expectType<string>(schema.where("foo", { attr: "bar" }).models[0].attr);
expectError(schema.where("foo", { bar: true }));
expectType<string>(
  schema.where("foo", (foo) => foo.attr === "ok").models[0].attr
);
expectError(schema.where("foo", (foo) => foo.x === "ok"));
expectError(schema.where("cow", { attr: "bar" }));

expectType<string>(schema.all("foo").models[0].attr);
expectError(schema.all("cow"));

expectType<string>(schema.none("foo").models[0].attr);
expectError(schema.none("cow"));

expectType<string | undefined>(schema.first("foo")?.attr);
expectError(schema.first("cow"));
