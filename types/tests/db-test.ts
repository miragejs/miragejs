import DbCollection from "miragejs/db-collection";
import { Server } from "miragejs/server";

const server: Server = new Server();

server.db.loadData({
  movies: [
    { title: "Interstellar" },
    { title: "Inception" },
    { title: "Dunkirk" },
  ],
});

const myDb = server.db; // $ExpectType Db

interface Movie {
  title: string;
}

myDb.createCollection("movies", [{ title: "Interstellar" }]); // $ExpectType void
myDb.dump(); // $ExpectType void
myDb.emptyData(); // $ExpectType void
myDb.loadData({}); // $ExpectType void

const dbCollection = new DbCollection("movies", [{ title: "Dunkirk" }]);

myDb.users.find(1); // $ExpectType any
myDb.users.find([1, 2]); // $ExpectType any
myDb.users.findBy({ name: "Link" }); // $ExpectType any
myDb.users.where({ name: "Link" }); // $ExpectType any
myDb.users.insert({}); // $ExpectType any
myDb.users.insert([]); // $ExpectType any
myDb.users.firstOrCreate({ name: "Link" }); // $ExpectType any
myDb.users.remove(); // $ExpectType void
myDb.users.remove(1); // $ExpectType void
myDb.users.remove({ name: "Zelda" }); // $ExpectType void
myDb.users.update({ name: "Ganon" }); // $ExpectType any
myDb.users.update(1, { name: "Young Link" }); // $ExpectType any
myDb.users.update({ name: "Link" }, { name: "Epona" }); // $ExpectType any
