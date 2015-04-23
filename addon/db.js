import Ember from 'ember';

var allDigitsRegex = /^\d+$/;

/*
  An identity map.
*/
export default function() {

  this.createCollection = function(collection) {
    var _this = this;

    this[collection] = [];

    // Attach the methods to the collection
    ['insert', 'find', 'where', 'update', 'remove']
      .forEach(function(method) {
        _this[collection][method] = function() {
          var args = [collection];
          for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          return _this['_' + method].apply(_this, args);
        };
      });

    return this;
  };

  this.createCollections = function() {
    var _this = this;
    var args = Array.prototype.slice.call(arguments);

    args.forEach(function(collection) {
      _this.createCollection(collection);
    });
  };

  this.loadData = function(data) {
    var _this = this;

    Ember.keys(data).forEach(function(collection) {
      _this.createCollection(collection);
      _this._insert(collection, data[collection]);
    });
  };

  this._insert = function(collection, data) {
    var _this = this;
    var copy = JSON.parse(JSON.stringify(data));
    var returnData;

    if (!Ember.isArray(copy)) {
      var attrs = copy;
      if (!attrs.id) {
        attrs.id = _this[collection].length + 1;
      }

      _this[collection].push(attrs);
      returnData = attrs;

    } else {
      returnData = [];
      copy.forEach(function(attrs) {
        if (!attrs.id) {
          attrs.id = _this[collection].length + 1;
        }

        _this[collection].push(attrs);
        returnData.push(attrs);
      });
    }

    return returnData;
  };

  this._find = function(collection, id) {
    // If parses, coerce to integer
    if (typeof id === "string" && allDigitsRegex.test(id)) {
      id = parseInt(id, 10);
    }

    return this[collection].filter(function(obj) {
      return obj.id === id;
    })[0];
  };

  this._where = function(collection, query) {
    var records = this[collection];

    Object.keys(query).forEach(function(queryKey) {
      records = records.filter(function(record) {
        return record[queryKey] === query[queryKey];
      });
    });

    return records;
  };

  this._update = function(collection, target, attrs) {
    if (typeof attrs === 'undefined') {
      attrs = target;
      this[collection].forEach(function(record) {
        Object.keys(attrs).forEach(function(attr) {
          record[attr] = attrs[attr];
        });
      });

    } else if (typeof target === 'number' || typeof target === 'string') {
      var id = target;
      var record = this._find(collection, id);

      Object.keys(attrs).forEach(function(attr) {
        record[attr] = attrs[attr];
      });

    } else if (typeof target === 'object') {
      var query = target;
      var records = this._where(collection, query);

      records.forEach(function(record) {
        Object.keys(attrs).forEach(function(attr) {
          record[attr] = attrs[attr];
        });
      });
    }
  };

  this._remove = function(collection, target) {
    var _this = this;

    if (typeof target === 'undefined') {
      this[collection] = [];

    } else if (typeof target === 'number' || typeof target === 'string') {
      var record = this._find(collection, target);
      var index = this[collection].indexOf(record);
      this[collection].splice(index, 1);
    } else if (typeof target === 'object') {
      var records = this._where(collection, target);
      records.forEach(function(record) {
        var index = _this[collection].indexOf(record);
        _this[collection].splice(index, 1);
      });
    }
  };


  this.emptyData = function() {
    var _this = this;
    Object.keys(this).forEach(function(key) {
      if (key === 'loadData' || key === 'emptyData') {
        return;
      }

      _this[key] = {};
    });
  };
}
