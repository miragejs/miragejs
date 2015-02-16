import { pluralize } from './inflector';
/*
  An identity map.
*/
export default {

  _data: {},

  loadData: function(data, key) {
    var copy = JSON.parse(JSON.stringify(data));

    if (key) {
      this._data[key] = copy;
    } else {
      this._data = copy;
    }
  },

  emptyData: function() {
    this._data = {};
  },

  find: function(type, id) {
    // If parses, coerce to integer
    id = parseInt(id, 10) || id;
    var data = this._findDataForType(type).findBy('id', id);

    return data;
  },

  findAll: function(type) {
    return this._findDataForType(type);
  },

  findQuery: function(type, query) {
    var data = this._findDataForType(type);

    if (data) {
      Object.keys(query).forEach(function(queryKey) {
        data = data.filterBy(queryKey, query[queryKey]);
      });
    }

    return data;
  },

  push: function(type, attrs) {
    var data = {};
    var model;

    // Updating
    if (attrs.id) {
      model = this._updateRecord(type, attrs);

    // Creating
    } else {
      model = this._createRecord(type, attrs);
    }

    data[type] = model;
    return data;
  },

  remove: function(type, id) {
    var _this = this;
    var key = this._keyForType(type);

    this._data[key] = this._data[key].rejectBy('id', +id);
    return {};
  },

  removeQuery: function(type, query) {
    var _this = this;
    var key = this._keyForType(type);

    Object.keys(query).forEach(function(queryKey) {
      _this._data[key] = _this._data[key].rejectBy(queryKey, query[queryKey]);
    });

    return {};
  },

  /*
    Private methods
  */
  _createRecord: function(type, attrs) {
    var key = this._keyForType(type);
    var newId = 1;

    if (!this._data[key]) {
      this._data[key] = [];
    }

    var currentModels = this._data[key];

    if (currentModels.length) {
      var currentModelIds = currentModels.map(function(model) { return model.id; });
      newId = Math.max.apply(null, currentModelIds) + 1;
    }

    attrs.id = newId;
    this._data[key].push(attrs);

    return attrs;
  },

  _updateRecord: function(type, attrs) {
    var currentModel = this.find(type, attrs.id);
    Object.keys(attrs).forEach(function(attr) {
      currentModel[attr] = attrs[attr];
    });

    return currentModel;
  },

  _keyForType: function(type) {
    return pluralize(type);
  },

  _findDataForType: function(type) {
    var key = this._keyForType(type);

    return this._data ? this._data[key] : undefined;
  }
};
