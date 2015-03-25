/*
  The db, an identity map.

  Note the public methods return copies of the data,
  so the actual db records cannot be inadvertantly
  modified.
*/
class Db {

  constructor(initialData) {
    if (initialData) {
      this.loadData(initialData);
    }
  }

  loadData(data) {
    for (let collection in data) {
      this.createCollection(collection);
      this.insert(collection, data[collection]);
    }
  }

  createCollection(collection) {
    this[collection] = { _records: [] };

    // Attach the methods to the collection
    // TODO: use prototype?
    ['all', 'insert', 'find', 'where', 'update', 'remove']
      .forEach((method) => {
        this[collection][method] = this[method].bind(this, collection);
      });

    return this;
  }

  createCollections(...collections) {
    collections.forEach( c => this.createCollection(c) );
  }

  emptyData() {
    Object.keys(this).forEach((key) => {
      if (key === 'loadData' || key === 'emptyData') {
        return;
      }

      this[key] = {};
    });
  }

  all(collection) {
    let records = this[collection]._records;

    return records.map(r => JSON.parse(JSON.stringify(r)) );
  }

  insert(collection, data) {
    let copy = data ? JSON.parse(JSON.stringify(data)) : {};
    let records = this[collection]._records;
    let returnData;

    if (!_.isArray(copy)) {
      let attrs = copy;
      if (attrs.id === undefined || attrs.id === null) {
        attrs.id = records.length + 1;
      }

      records.push(attrs);
      returnData = JSON.parse(JSON.stringify(attrs));

    } else {
      returnData = [];
      copy.forEach(data => {
        if (data.id === undefined || data.id === null) {
          data.id = records.length + 1;
        }

        records.push(data);
        returnData.push(data);
        returnData = returnData.map( r => JSON.parse(JSON.stringify(r)) );
      });
    }

    return returnData;
  }

  find(collection, ids) {
    if (_.isArray(ids)) {
      let records = this._findRecords(collection, ids)
        .filter(r => r !== undefined);

      // Return a copy
      return records.map(r => JSON.parse(JSON.stringify(r)) );

    } else {
      let record = this._findRecord(collection, ids);
      if (!record) { return null; }

      // Return a copy
      return JSON.parse(JSON.stringify(record));
    }
  }

  where(collection, query) {
    let records = this._findRecordsWhere(collection, query);

    return records.map( r => JSON.parse(JSON.stringify(r)) );
  }

  update(collection, attrs, target) {
    let records;

    if (typeof target === 'undefined') {
      let changedRecords = [];
      this[collection]._records.forEach(function(record) {
        let oldRecord = _.assign({}, record);

        for (let attr in attrs) {
          record[attr] = attrs[attr];
        }

        if (!_.isEqual(oldRecord, record)) {
          changedRecords.push(record);
        }
      });

      return changedRecords;

    } else if (typeof target === 'number' || typeof target === 'string') {
      let id = target;
      let record = this._findRecord(collection, id);

      for (let attr in attrs) {
        record[attr] = attrs[attr];
      }

      return record;

    } else if (_.isArray(target)) {
      let ids = target;
      records = this._findRecords(collection, ids);

      records.forEach(record => {
        for (let attr in attrs) {
          record[attr] = attrs[attr];
        }
      });

      return records;

    } else if (typeof target === 'object') {
      let query = target;
      records = this._findRecordsWhere(collection, query);

      records.forEach(record => {
        for (let attr in attrs) {
          record[attr] = attrs[attr];
        }
      });

      return records;
    }
  }

  remove(collection, target) {
    let _collection = this[collection];
    let records;

    if (typeof target === 'undefined') {
      _collection._records = [];

    } else if (typeof target === 'number' || typeof target === 'string') {
      let record = this._findRecord(collection, target);
      let index = _collection._records.indexOf(record);
      _collection._records.splice(index, 1);

    } else if (_.isArray(target)) {
      records = this._findRecords(collection, target);
      records.forEach(record =>  {
        let index = _collection._records.indexOf(record);
        _collection._records.splice(index, 1);
      });

    } else if (typeof target === 'object') {
      records = this._findRecordsWhere(collection, target);
      records.forEach(record =>  {
        let index = _collection._records.indexOf(record);
        _collection._records.splice(index, 1);
      });
    }
  }


  /*
    Private methods.

    These return the actual db objects, whereas the public
    API query methods return copies.
  */

  _findRecord(collection, id) {
    let allDigitsRegex = /^\d+$/;

    // If parses, coerce to integer
    if (typeof id === 'string' && allDigitsRegex.test(id)) {
      id = parseInt(id, 10);
    }

    let record = this[collection]._records.filter(obj => obj.id === id)[0];

    return record;
  }

  _findRecords(collection, ids) {
    let records = ids.map(id => this._findRecord(collection, id));

    return records;
  }

  _findRecordsWhere(collection, query) {
    let records = this[collection]._records;

    for (let queryKey in query) {
      records = records.filter( r => String(r[queryKey]) === String(query[queryKey]) );
    }

    return records;
  }
}

export default Db;
