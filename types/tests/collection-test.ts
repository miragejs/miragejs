import { expectType, expectError } from "tsd";
import { Collection } from "miragejs";

type ModelType = { name: string };

const collection = new Collection<ModelType>();

expectType<Collection<ModelType>>(collection.add({ name: "Bob" }));
expectError(collection.add({ err: "err" }));

expectType<Collection<ModelType>>(collection.destroy());

expectType<Collection<ModelType>>(
  collection.filter((item) => item.name === "Bob")
);
expectError(collection.filter((item) => item.err === "Err"));

expectType<boolean>(collection.includes({ name: "Bob" }));
expectError(collection.includes({ err: "err" }));

expectType<Collection<ModelType>>(
  collection.mergeCollection(new Collection<ModelType>())
);
expectError(collection.mergeCollection(new Collection<{ err: string }>()));

expectType<Collection<ModelType>>(collection.reload());

expectType<Collection<ModelType>>(collection.remove({ name: "Bob" }));
expectError(collection.remove({ err: "Err" }));

expectType<Collection<ModelType>>(collection.save());

expectType<Collection<ModelType>>(collection.slice(0, 1));

expectType<Collection<ModelType>>(
  collection.sort((a, b) => {
    return a.name.localeCompare(b.name);
  })
);
expectError(
  collection.sort((a, b) => {
    return a.err.localeCompare(b.err);
  })
);

expectType<Collection<ModelType>>(collection.update("name", "John"));
expectError(collection.update("name", new Date()));
expectError(collection.update("err", "err"));
