import {expectType, expectError} from 'tsd';
import {
  belongsTo,
  Collection,
  hasMany,
  Instantiate,
  Model,
  Registry,
} from "miragejs";
import { ModelInstance } from "miragejs/-types";
import Schema from "miragejs/orm/schema";

const PersonModel = Model.extend({
  name: "hello",
  parent: belongsTo("person"),
  pets: hasMany("pet"),
  friends: hasMany<"pet" | "person">({ polymorphic: true }),

  nothing: belongsTo("nonexistent"),
  muchAdoAboutNothing: hasMany("nonexistent"),
});

const PetModel = Model.extend({
  name: "fido",
  owner: belongsTo("person"),
});

type PersonRegistry = Registry<
  { person: typeof PersonModel; pet: typeof PetModel },
  {}
>;
declare const schema: Schema<PersonRegistry>;

const people = schema.all("person");

expectType<number>(people.length);
expectType<string>(people.modelName);
people.models.map((model) => {
  expectType<unknown>(model.nothing);
  expectType<Collection<unknown>>(model.muchAdoAboutNothing);

  expectType<string | undefined>(model.parent?.name);
  expectType<string | undefined>(model.parent?.parent?.name);
  expectType<string>(model.pets.models[0].name);

  // Polymorphic relationship
  const friend = model.friends.models[0];

  // Both 'pet' and 'person' models have a name, but no other shared fields
  expectType<string>(friend.name);
  expectError(friend.parent);
  expectError(friend.friends);
  expectError(friend.owner);

  if ("parent" in friend) {
    // Here we know friend is a person
    expectType<string>(friend.parent!.name);
    expectType<number>(friend.friends.length);
  } else {
    // Here we know friend is a pet
    expectType<string>(friend.owner!.name);
  }
});

const child = schema.create("person", {
  parent: schema.create("person"),
});

// Here we know `parent` is defined because it was just passed in
expectType<string>(child.parent.name);

expectError(schema.create("person", { parent: "hi" }));

const pet1 = schema.create("pet");
const pet2 = schema.create("pet");

// We can instantiate a hasMany with either an array or a collection
// Either way, the instance should have a collection.

const personWithPetsArray = schema.create("person", {
  pets: [pet1, pet2],
});

personWithPetsArray.update("pets", [pet1]);
personWithPetsArray.update({
  pets: [pet1, pet2],
});
personWithPetsArray.update(
  "pets",
  new Collection<Instantiate<PersonRegistry, "pet">>()
);

expectType<string>(personWithPetsArray.pets.modelName);

const personWithPetsCollection = schema.create("person", {
  pets: schema.all("pet"),
});

expectType<string>(personWithPetsCollection.pets.modelName);

expectError(schema.create("person", { pets: [child] }));
expectError(schema.create("person", { pets: schema.all("person") }));
