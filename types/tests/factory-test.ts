import { Factory, Model, Registry } from "miragejs";
import Schema from "miragejs/orm/schema";

const PersonModel = Model.extend({
  name: "hello",
});

const PersonFactory = Factory.extend({
  age: 42,
  height(n: number) {
    return `${n}'`;
  },
});

declare const schema: Schema<Registry<
  { person: typeof PersonModel },
  { person: typeof PersonFactory }
>>;

const people = schema.all("person");

people.length; // $ExpectType number
people.modelName; // $ExpectType string
people.models.map((model) => {
  model.id; // $ExpectType string | undefined
  model.name; // $ExpectType string
  model.attrs; // $ExpectType Record<string, unknown>
  model.age; // $ExpectType number
  model.height; // $ExpectType string
  model.foo; // $ExpectError
});

schema.create("person").height; // $ExpectType string
schema.create("person", {}).height; // $ExpectType string
schema.create("person", { height: "custom" }).height; // $ExpectType string

schema.create("person", { height: 123 }); // $ExpectError
schema.create("person", { foo: "bar" }); // $ExpectError
