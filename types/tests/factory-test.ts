import { expectType, expectError } from "tsd";
import { Factory, Model, Registry } from "miragejs";
import Schema from "miragejs/orm/schema";

const PersonModel = Model.extend({
  name: "hello",
});

interface Person {
  age: number;
  height: string;
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
});

const PersonFactoryExplicit = Factory.extend<Partial<Person>>({
  height(n: number) {
    return `${n}'`;
  },
});

declare const schema: Schema<
  Registry<
    { personExplicit: typeof PersonModel; personInferred: typeof PersonModel },
    {
      personExplicit: typeof PersonFactoryExplicit;
      personInferred: typeof PersonFactoryInferred;
    }
  >
>;

{
  const people = schema.all("personExplicit");

  expectType<number>(people.length);
  expectType<string>(people.modelName);
  people.models.map((model) => {
    expectType<string | undefined>(model.id);
    expectType<string>(model.name);
    expectType<{
      name: string;
      age?: number | undefined;
      height?: string | undefined;
    }>(model.attrs);
    expectType<number | undefined>(model.age);
    expectType<string | undefined>(model.height);
    expectError(model.foo);
  });

  expectType<string>(schema.create("personExplicit").height);
  expectType<string | undefined>(schema.create("personExplicit", {}).height);
  expectType<string>(
    schema.create("personExplicit", { height: "custom" }).height
  );

  expectError(schema.create("personExplicit", { height: 123 }));
  expectError(schema.create("personExplicit", { foo: "bar" }));
}

{
  const people = schema.all("personInferred");

  expectType<number>(people.length);
  expectType<string>(people.modelName);
  people.models.map((model) => {
    expectType<string | undefined>(model.id);
    expectType<string>(model.name);
    expectType<{ name: string; age: number; height: string }>(model.attrs);
    expectType<number>(model.age);
    expectType<string>(model.height);
    expectError(model.foo);
  });

  expectType<string>(schema.create("personInferred").height);
  expectType<string>(schema.create("personInferred", {}).height);
  expectType<string>(
    schema.create("personInferred", { height: "custom" }).height
  );

  expectError(schema.create("personInferred", { height: 123 }));
  expectError(schema.create("personInferred", { foo: "bar" }));
}
