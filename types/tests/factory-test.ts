import { Factory, Model, Registry, belongsTo, Server } from "miragejs";
import Schema from "miragejs/orm/schema";

const PersonModel = Model.extend({
  name: "hello",
  address: belongsTo(),
});

const AddressModel = Model.extend({
  street: "Meat Street",
  person: belongsTo(),
});

interface Person {
  age: number;
  height: string;
  address: Address;
}

interface Address {
  street: string;
}

/**
 * We show two methods of using the factories here:
 * - For PersonFactoryInferred, we show that we can infer
 *   the properties from your typedefs. This is appropriate
 *   if all of the properties on your object can be auto-generated with a factory
 * - For PersonFactoryExplicit, we demonstrate passing an actual type argument to
 *   Factory.extend, so that you can have extra properties on the model without having
 *   to create generators.
 */

const PersonFactoryInferred = Factory.extend({
  age: 42,
  height(n: number) {
    return `${n}'`;
  },
  aftercreate(person, server: Server) {
    person.update({ address: server.create("address") });
  },
});

const PersonFactoryExplicit = Factory.extend<Partial<Person>>({
  height(n: number) {
    return `${n}'`;
  },
});

type RegistryFixture = Registry<
  {
    personExplicit: typeof PersonModel;
    personInferred: typeof PersonModel;
    address: typeof AddressModel;
  },
  {
    personExplicit: typeof PersonFactoryExplicit;
    personInferred: typeof PersonFactoryInferred;
    address: typeof AddressModel;
  }
>;

declare const schema: Schema<RegistryFixture>;

{
  const people = schema.all("personExplicit");

  people.length; // $ExpectType number
  people.modelName; // $ExpectType string
  people.models.map((model) => {
    model.id; // $ExpectType string | undefined
    model.name; // $ExpectType string
    model.attrs; // $ExpectType { name: string; age?: number | undefined; height?: string | undefined; }
    model.age; // $ExpectType number | undefined
    model.height; // $ExpectType string | undefined
    model.foo; // $ExpectError
  });

  schema.create("personExplicit").height; // $ExpectType string
  schema.create("personExplicit", {}).height; // $ExpectType string | undefined
  schema.create("personExplicit", { height: "custom" }).height; // $ExpectType string

  schema.create("personExplicit", { height: 123 }); // $ExpectError
  schema.create("personExplicit", { foo: "bar" }); // $ExpectError
}

{
  const people = schema.all("personInferred");

  people.length; // $ExpectType number
  people.modelName; // $ExpectType string
  people.models.map((model) => {
    model.id; // $ExpectType string | undefined
    model.name; // $ExpectType string
    model.attrs; // $ExpectType { name: string; age: number; height: string; }
    model.age; // $ExpectType number
    model.height; // $ExpectType string
    model.foo; // $ExpectError
  });

  schema.create("personInferred").height; // $ExpectType string
  schema.create("personInferred", {}).height; // $ExpectType string
  schema.create("personInferred", { height: "custom" }).height; // $ExpectType string

  schema.create("personInferred", { height: 123 }); // $ExpectError
  schema.create("personInferred", { foo: "bar" }); // $ExpectError
}
