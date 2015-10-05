function stringify(data) {
  return JSON.parse(JSON.stringify(data));
}

/*
  A collection of db records i.e. a database table.
*/
class DbCollection {

  constructor(name, initialData) {
    this.name = name;
    this._records = [];

    if (initialData) {
      this.insert(initialData);
    }
  }

  /*
    Returns a copy of the data, to prevent inadvertant data manipulation.
  */
  all() {
    return stringify(this._records);
  }

  insert(data) {
    let copy = data ? stringify(data) : {};
    let records = this._records;
    let returnData;

    if (!_.isArray(copy)) {
      let attrs = copy;
      if (attrs.id === undefined || attrs.id === null) {
        attrs.id = records.length + 1;
      }

      records.push(attrs);
      returnData = stringify(attrs);

    } else {
      returnData = [];
      copy.forEach(data => {
        if (data.id === undefined || data.id === null) {
          data.id = records.length + 1;
        }

        records.push(data);
        returnData.push(data);
        returnData = returnData.map( r => stringify(r) );
      });
    }

    return returnData;
  }

  find(ids) {
    if (_.isArray(ids)) {
      let records = this._findRecords(ids)
        .filter(r => r !== undefined);

      // Return a copy
      return records.map(r => stringify(r) );

    } else {
      let record = this._findRecord(ids);
      if (!record) { return null; }

      // Return a copy
      return stringify(record);
    }
  }

  where(query) {
    let records = this._findRecordsWhere(query);

    return records.map( r => stringify(r) );
  }

  firstOrCreate(query, attributesForNew={}) {
    let queryResult = this.where(query);
    let record = queryResult[0];

    if (record) {
      return record;
    } else {
      let mergedAttributes = _.assign(attributesForNew, query);
      let createdRecord = this.insert(mergedAttributes);

      return createdRecord;
    }
  }

  update(target, attrs) {
    let records;

    if (typeof attrs === 'undefined') {
      attrs = target;
      let changedRecords = [];
      this._records.forEach(function(record) {
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
      let record = this._findRecord(id);

      for (let attr in attrs) {
        record[attr] = attrs[attr];
      }

      return record;

    } else if (_.isArray(target)) {
      let ids = target;
      records = this._findRecords(ids);

      records.forEach(record => {
        for (let attr in attrs) {
          record[attr] = attrs[attr];
        }
      });

      return records;

    } else if (typeof target === 'object') {
      let query = target;
      records = this._findRecordsWhere(query);

      records.forEach(record => {
        for (let attr in attrs) {
          record[attr] = attrs[attr];
        }
      });

      return records;
    }
  }

  remove(target) {
    let records;

    if (typeof target === 'undefined') {
      this._records = [];

    } else if (typeof target === 'number' || typeof target === 'string') {
      let record = this._findRecord(target);
      let index = this._records.indexOf(record);
      this._records.splice(index, 1);

    } else if (_.isArray(target)) {
      records = this._findRecords(target);
      records.forEach(record =>  {
        let index = this._records.indexOf(record);
        this._records.splice(index, 1);
      });

    } else if (typeof target === 'object') {
      records = this._findRecordsWhere(target);
      records.forEach(record =>  {
        let index = this._records.indexOf(record);
        this._records.splice(index, 1);
      });
    }
  }


  /*
    Private methods.

    These return the actual db objects, whereas the public
    API query methods return copies.
  */

  _findRecord(id) {
    let allDigitsRegex = /^\d+$/;

    // If parses, coerce to integer
    if (typeof id === 'string' && allDigitsRegex.test(id)) {
      id = parseInt(id, 10);
    }

    let record = this._records.filter(obj => obj.id === id)[0];

    return record;
  }

  _findRecords(ids) {
    let records = ids.map(id => this._findRecord(id));

    return records;
  }

  _findRecordsWhere(query) {
    let records = this._records;

    for (let queryKey in query) {
      records = records.filter( r => String(r[queryKey]) === String(query[queryKey]) );
    }

    return records;
  }
}

export default DbCollection;
