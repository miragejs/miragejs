import { expectType, expectError } from "tsd";
import { Model, Registry } from "miragejs";
import Schema from "miragejs/orm/schema";

const PersonModel = Model.extend({
  name: "hello",
});

declare const schema: Schema<Registry<{ person: typeof PersonModel }, {}>>;

const people = schema.all("person");

expectType<number>(people.length);
expectType<string>(people.modelName);
people.models.map((model) => {
  expectType<string | undefined>(model.id);
  expectType<string>(model.name);
  expectType<string>(model.modelName);
  expectType<{ name: string }>(model.attrs);
  expectError(model.foo);

  expectType<void>(model.save());
  expectType<void>(model.reload());
  expectType<void>(model.destroy());

  expectType<void>(model.update("name", "goodbye"));
  expectError(model.update("name", false));
  expectError(model.update("bad", "ok"));
});

expectType<string>(schema.create("person").name);
expectType<string>(schema.create("person", {}).name);
expectType<string>(schema.create("person", { name: "custom" }).name);

expectError(schema.create("person", { name: 123 }));
expectError(schema.create("person", { foo: "bar" }));
