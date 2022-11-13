import Collection, { ModelInstance } from "orm/collection";

type ModelType = { name: string };

const collection = new Collection<ModelInstance<ModelType>>();

collection.add({
  name: "Bob",
  attrs: {
    name: ""
  },
  modelName: "",
  save: function (): void {
    throw new Error("Function not implemented.");
  },
  update<K extends "name">(key: K | Partial<ModelType>, value?: ModelType[K]): void {
    throw new Error("Function not implemented.");
  },
  destroy: function (): void {
    throw new Error("Function not implemented.");
  },
  reload: function (): void {
    throw new Error("Function not implemented.");
  }
}); // $ExpectType Collection<ModelType>
collection.add({ err: "err" }); // $ExpectError

collection.destroy(); // $ExpectType Collection<ModelType>

collection.filter((item) => item.name === "Bob"); // $ExpectType Collection<ModelType>
collection.filter((item) => item.err === "Err"); // $ExpectError

collection.includes({ name: "Bob" }); // $ExpectType boolean
collection.includes({ err: "err" }); // $ExpectError

collection.mergeCollection(new Collection<ModelInstance<ModelType>>()); // $ExpectType Collection<ModelType>
collection.mergeCollection(new Collection<{ err: string }>()); // $ExpectError

collection.reload(); // $ExpectType Collection<ModelType>

collection.remove({ name: "Bob" }); // $ExpectType Collection<ModelType>
collection.remove({ err: "Err" }); // $ExpectError

collection.save(); // $ExpectType Collection<ModelType>

collection.slice(0, 1); // $ExpectType Collection<ModelType>

// $ExpectType Collection<ModelType>
collection.sort((a, b) => {
  return a.name.localeCompare(b.name);
});
collection.sort((a, b) => {
  return a.err.localeCompare(b.err); // $ExpectError
});

collection.update("name", "John"); // $ExpectType Collection<ModelType>
collection.update("name", new Date()); // $ExpectError
collection.update("err", "err"); // $ExpectError
