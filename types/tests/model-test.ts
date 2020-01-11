import { Model, Registry } from "miragejs";
import Schema from "miragejs/orm/schema";

const PersonModel = Model.extend({
  name: "hello"
});

declare const schema: Schema<Registry<{ person: typeof PersonModel }, {}>>;

const people = schema.all("person");

people.length; // $ExpectType number
people.modelName; // $ExpectType string
people.models.map(model => {
  model.id; // $ExpectType string | undefined
  model.name; // $ExpectType string
  model.modelName; // $ExpectType string
  model.attrs; // $ExpectType Record<string, unknown>
  model.foo; // $ExpectError

  model.save();
  model.reload();
  model.destroy();

  model.update("name", "goodbye");
  model.update("name", false); // $ExpectError
  model.update("bad", "ok"); // $ExpectError
});

schema.create("person").name; // $ExpectType string
schema.create("person", {}).name; // $ExpectType string
schema.create("person", { name: "custom" }).name; // $ExpectType string

schema.create("person", { name: 123 }); // $ExpectError
schema.create("person", { foo: "bar" }); // $ExpectError
