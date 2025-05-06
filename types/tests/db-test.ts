import {expectType, expectError} from 'tsd';
import DbCollection from "miragejs/db-collection";
import { Server } from "miragejs/server";
import { Registry } from "miragejs";
import { ModelDefinition } from "miragejs/-types";
import Db from 'miragejs/db';

const server: Server = new Server();

server.db.loadData({
  movies: [
    { title: "Interstellar" },
    { title: "Inception" },
    { title: "Dunkirk" },
  ],
});

const myDb = server.db;
expectType<Db>(myDb);

interface Movie {
  title: string;
}

expectType<void>(myDb.createCollection("movies", [{ title: "Interstellar" }]));
expectType<void>(myDb.dump());
expectType<void>(myDb.emptyData());
expectType<void>(myDb.loadData({}));

const dbCollection = new DbCollection("movies", [{ title: "Dunkirk" }]);

expectType<any>(myDb.users.find(1));
expectType<any>(myDb.users.find([1, 2]));
expectType<any>(myDb.users.findBy({ name: "Link" }));
expectType<any>(myDb.users.where({ name: "Link" }));
expectType<any>(myDb.users.insert({}));
expectType<any>(myDb.users.insert([]));
expectType<any>(myDb.users.firstOrCreate({ name: "Link" }));
expectType<void>(myDb.users.remove());
expectType<void>(myDb.users.remove(1));
expectType<void>(myDb.users.remove({ name: "Zelda" }));
expectType<any>(myDb.users.update({ name: "Ganon" }));
expectType<any>(myDb.users.update(1, { name: "Young Link" }));
expectType<any>(myDb.users.update({ name: "Link" }, { name: "Epona" }));

type TestModels = {
  movie: ModelDefinition<Movie>;
};

type TestRegistry = Registry<TestModels, {}>;

const testServer = new Server<TestRegistry>();

// There's a problem with dtslint that we can't specify different results for different
// versions of typescript.  The result here will be either `ModelInstance<{ title: string; }> | null`
// or `Instantiate<TestRegistry, "movie"> | null`, depending on TS version.
testServer.schema.findBy("movie", (instance) => instance.title.length > 0);
