import {
  Factory,
  Response,
  Model,
  Serializer,
  ActiveModelSerializer,
  JSONAPISerializer,
  hasMany,
  belongsTo,
  IdentityManager
} from "@miragejs/server";

test("Factory is present in named exports from ember-cli-mirage", () => {
  expect(Factory).toBeTruthy();
});

test("Response is present in named exports from ember-cli-mirage", () => {
  expect(Response).toBeTruthy();
});

test("Model is present in named exports from ember-cli-mirage", () => {
  expect(Model).toBeTruthy();
});

test("serializers are present in named exports from ember-cli-mirage", () => {
  expect(ActiveModelSerializer).toBeTruthy();
  expect(JSONAPISerializer).toBeTruthy();
  expect(Serializer).toBeTruthy();
});

test("relationship helpers are present in named exports from ember-cli-mirage", () => {
  expect(hasMany).toBeTruthy();
  expect(belongsTo).toBeTruthy();
});

test("IdentityManager ist present in named exports from ember-cli-mirage", () => {
  expect(IdentityManager).toBeTruthy();
});
