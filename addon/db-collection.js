import _assign from 'lodash/object/assign';
import _isArray from 'lodash/lang/isArray';
import _isEqual from 'lodash/lang/isEqual';
import _sortBy from 'lodash/collection/sortBy';

function duplicate(data) {
  if (_isArray(data)) {
    return data.map(duplicate);
  } else {
    return _assign({}, data);
  }
}

function isNumber(n) {
  return (+n).toString() === n.toString();
}

/**
 *  A collection of db records i.e. a database table.
 *  @class DbCollection
 *  @constructor
 *  @public
 */
class DbCollection {

  constructor(name, initialData) {
    this.name = name;
    this._records = [];
    this.identityManager = new IdentityManager();

    if (initialData) {
      this.insert(initialData);
    }
  }

  /**
   * Returns a copy of the data, to prevent inadvertent data manipulation.
   * @method all
   * @public
   */
  all() {
    return duplicate(this._records);
  }

  /**
   * Inserts `data` into the collection. `data` can be a single object
   * or an array of objects. Returns the inserted record.
   * @method insert
   * @param data
   * @public
   */
  insert(data) {
    if (!_isArray(data)) {
      return this._insertRecord(data);
    } else {
      // Need to sort in order to ensure IDs inserted in the correct order
      return _sortBy(data, 'id').map(this._insertRecord, this);
    }
  }

  /**
   * Returns a single record from the `collection` if `ids` is a single
   * id, or an array of records if `ids` is an array of ids. Note
   * each id can be an int or a string, but integer ids as strings
   * (e.g. the string “1”) will be treated as integers.
   * @method find
   * @param ids
   * @public
   */
  find(ids) {
    if (_isArray(ids)) {
      let records = this._findRecords(ids)
        .filter(Boolean)
        .map(duplicate); // Return a copy

      return records;
    } else {
      let record = this._findRecord(ids);
      if (!record) {
        return null;
      }

      // Return a copy
      return duplicate(record);
    }
  }

  /**
   * Returns an array of models from `collection` that match the
   * key-value pairs in the `query` object. Note that a string
   * comparison is used. `query` is a POJO.
   * @method where
   * @param query
   * @public
   */
  where(query) {
    return this._findRecordsWhere(query).map(duplicate);
  }

  /**
   * Finds the first record matching the provided query in
   * `collection`, or creates a new record using a merge of the
   * `query` and optional `attributesForCreate`.
   * @method firstOrCreate
   * @param query
   * @param attributesForCreate
   * @public
   */
  firstOrCreate(query, attributesForCreate={}) {
    let queryResult = this.where(query);
    let [ record ] = queryResult;

    if (record) {
      return record;
    } else {
      let mergedAttributes = _assign(attributesForCreate, query);
      let createdRecord = this.insert(mergedAttributes);

      return createdRecord;
    }
  }

  /**
   * Updates one or more records in collection.
   * If attrs is the only arg present, updates all records
   * in the collection according to the key-value pairs in attrs.
   * If target is present, restricts updates to those that
   * match target. If target is a number or string, finds a
   * single record whose id is target to update. If target is
   * a POJO, queries collection for records that match the
   * key-value pairs in target, and updates their attrs.
   * Returns the updated record or records.
   * @method update
   * @param target
   * @param attrs
   * @public
   */
  update(target, attrs) {
    let records;

    if (typeof attrs === 'undefined') {
      attrs = target;
      let changedRecords = [];

      this._records.forEach((record) => {
        let oldRecord = _assign({}, record);

        this._updateRecord(record, attrs);

        if (!_isEqual(oldRecord, record)) {
          changedRecords.push(record);
        }
      });

      return changedRecords;

    } else if (typeof target === 'number' || typeof target === 'string') {
      let id = target;
      let record = this._findRecord(id);

      this._updateRecord(record, attrs);

      return record;

    } else if (_isArray(target)) {
      let ids = target;
      records = this._findRecords(ids);

      records.forEach((record) => {
        this._updateRecord(record, attrs);
      });

      return records;

    } else if (typeof target === 'object') {
      let query = target;
      records = this._findRecordsWhere(query);

      records.forEach((record) => {
        this._updateRecord(record, attrs);
      });

      return records;
    }
  }

  /**
   * Removes one or more records in `collection`.
   * If `target` is undefined, removes all records.
   * If `target` is a number or string, removes a
   * single record using `target` as id. If `target` is
   * a POJO, queries `collection` for records that
   * match the key-value pairs in `target`, and
   * removes them from the collection.
   * @method remove
   * @param target
   * @public
   */
  remove(target) {
    let records;

    if (typeof target === 'undefined') {
      this._records = [];
      this.identityManager.reset();

    } else if (typeof target === 'number' || typeof target === 'string') {
      let record = this._findRecord(target);
      let index = this._records.indexOf(record);
      this._records.splice(index, 1);

    } else if (_isArray(target)) {
      records = this._findRecords(target);
      records.forEach((record) =>  {
        let index = this._records.indexOf(record);
        this._records.splice(index, 1);
      });

    } else if (typeof target === 'object') {
      records = this._findRecordsWhere(target);
      records.forEach((record) =>  {
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

  /**
   * @method _findRecord
   * @param id
   * @private
   */
  _findRecord(id) {
    id = id.toString();

    let [ record ] = this._records.filter((obj) => obj.id === id);

    return record;
  }

  /**
   * @method _findRecords
   * @param ids
   * @private
   */
  _findRecords(ids) {
    return ids.map(this._findRecord, this);
  }

  /**
   * @method _findRecordsWhere
   * @param query
   * @private
   */
  _findRecordsWhere(query) {
    let records = this._records;

    function defaultQueryFunction(record) {
      let keys = Object.keys(query);

      return keys.every(function(key) {
        return String(record[key]) === String(query[key]);
      });
    }

    let queryFunction = typeof query === 'object' ? defaultQueryFunction : query;

    return records.filter(queryFunction);
  }

  /**
   * @method _insertRecord
   * @param data
   * @private
   */
  _insertRecord(data) {
    let attrs = duplicate(data);

    if (attrs && (attrs.id === undefined || attrs.id === null)) {
      attrs.id = this.identityManager.fetch();
    } else {
      attrs.id = attrs.id.toString();

      this.identityManager.set(attrs.id);
    }

    this._records.push(attrs);

    return duplicate(attrs);
  }

  /**
   * @method _updateRecord
   * @param record
   * @param attrs
   * @private
   */
  _updateRecord(record, attrs) {
    let targetId = (attrs && attrs.hasOwnProperty('id')) ? attrs.id.toString() : null;
    let currentId = record.id;

    if (targetId && currentId !== targetId) {
      throw new Error('Updating the ID of a record is not permitted');
    }

    for (let attr in attrs) {
      if (attr === 'id') {
        continue;
      }

      record[attr] = attrs[attr];
    }
  }
}

class IdentityManager {
  constructor() {
    this._nextId = 1;
    this._ids = {};
  }

  get() {
    return this._nextId;
  }

  set(n) {
    if (this._ids[n]) {
      throw new Error(`Attempting to use the ID ${n}, but it's already been used`);
    }

    if (isNumber(n) && +n >= this._nextId) {
      this._nextId = +n + 1;
    }

    this._ids[n] = true;
  }

  inc() {
    let nextValue = this.get() + 1;

    this._nextId = nextValue;

    return nextValue;
  }

  fetch() {
    let id = this.get();

    this._ids[id] = true;

    this.inc();

    return id.toString();
  }

  reset() {
    this._nextId = 1;
    this._ids = {};
  }
}

export default DbCollection;

export { IdentityManager };
