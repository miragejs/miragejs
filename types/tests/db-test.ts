import DbCollection from "miragejs/db-collection";
import { Server } from "miragejs/server";

const server: Server = new Server();

server.db.loadData({
  movies: [
    { title: "Interstellar" },
    { title: "Inception" },
    { title: "Dunkirk" }
  ]
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

myDb.users.find(1);
myDb.users.find([1, 2]);
myDb.users.findBy({ name: "Link" });
myDb.users.where({ name: "Link" });
myDb.users.insert({});
myDb.users.insert([]);
myDb.users.firstOrCreate({ name: "Link" });
myDb.users.remove();
myDb.users.remove(1);
myDb.users.remove({ name: "Zelda" });
myDb.users.update({ name: "Ganon" });
myDb.users.update(1, { name: "Young Link" });
myDb.users.update({ name: "Link" }, { name: "Epona" });
