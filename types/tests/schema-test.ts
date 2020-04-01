import Schema from "miragejs/orm/schema";

declare const schema: Schema<{ foo: { attr: string }; bar: { prop: number } }>;

schema.create("foo").attr; // $ExpectType string
schema.create("foo", { attr: "ok" }).attr; // $ExpectType string
schema.create("foo", { attr: 123 }); // $ExpectError
schema.create("foo", { x: true }); // $ExpectError
schema.create("cow"); // $ExpectError

schema.find("foo", "123"); // $ExpectType { attr: string; } | null
schema.find("foo", ["123"]).models[0]; // $ExpectType { attr: string; }
schema.find("cow", "123"); // $ExpectError

schema.findBy("bar", {}); // $ExpectType { prop: number; } | null
schema.findBy("bar", { prop: 5 }); // $ExpectType { prop: number; } | null
schema.findBy("bar", { baz: "hi" }); // $ExpectError
schema.findBy("cow", { attr: "bar" }); // $ExpectError

schema.findOrCreateBy("foo", { attr: "hi" }); // $ExpectType { attr: string; }
schema.findOrCreateBy("foo", { bar: true }); // $ExpectError
schema.findOrCreateBy("cow", { attr: "bar" }); // $ExpectError

schema.where("foo", { attr: "bar" }); // $ExpectType Collection<{ attr: string; }>
schema.where("foo", { bar: true }); // $ExpectError
schema.where("foo", foo => foo.attr === "ok"); // $ExpectType Collection<{ attr: string; }>
schema.where("foo", foo => foo.x === "ok"); // $ExpectError
schema.where("cow", { attr: "bar" }); // $ExpectError

schema.all("foo"); // $ExpectType Collection<{ attr: string; }>
schema.all("cow"); // $ExpectError

schema.none("foo"); // $ExpectType Collection<{ attr: string; }>
schema.none("cow"); // $ExpectError

schema.first("foo"); // $ExpectType { attr: string; } | null
schema.first("cow"); // $ExpectError
