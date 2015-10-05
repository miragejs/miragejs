import DbCollection from './db-collection';

/*
  The db, an identity map.
*/
class Db {

  constructor(initialData) {
    this._collections = [];

    if (initialData) {
      this.loadData(initialData);
    }
  }

  loadData(data) {
    for (let key in data) {
      this.createCollection(key, data[key]);
    }
  }

  createCollection(name, initialData) {
    if (!this[name]) {
      var newCollection = new DbCollection(name, initialData);

      Object.defineProperty(this, name, {
        get() {
          var recordsCopy = newCollection.all();

          ['insert', 'find', 'where', 'update', 'remove', 'firstOrCreate']
            .forEach(function(method) {
              recordsCopy[method] = newCollection[method].bind(newCollection);
            });

          return recordsCopy;
        }
      });

      this._collections.push(newCollection);

    } else if (initialData) {
      this[name].insert(initialData);
    }

    return this;
  }

  createCollections(...collections) {
    collections.forEach( c => this.createCollection(c) );
  }

  emptyData() {
    this._collections.forEach( c => c.remove() );
  }
}

export default Db;
