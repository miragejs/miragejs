/*
  An identity map.
*/
export default {

  _data: {},

  loadData: function(data, key) {
    if (key) {
      this._data[key] = data;
    } else {
      this._data = data;
    }
  },

  emptyData: function() {
    this._data = {};
  },

  find: function(key, id) {
    key = key.pluralize();
    var data;
    var query;

    // If parses, coerce to integer
    id = parseInt(id, 10) || id;

    if (this._data && this._data[key]) {
      data = this._data[key].findBy('id', id);
    }

    return data;
  },

  findAll: function(key) {
    key = key.pluralize();
    var data;

    if (this._data) {
      data = this._data[key];
    }

    return data;
  },

  findQuery: function(key, query) {
    key = key.pluralize();
    var data = this._data[key];

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

    data[type] = model
    return data;
  },

  _createRecord: function(type, attrs) {
    var dataKey = type.pluralize();
    var newId = 1;

    if (!this._data[dataKey]) {
      this._data[dataKey] = []
    }

    var currentModels = this._data[dataKey];

    if (currentModels.length) {
      var currentModelIds = currentModels.map(function(model) { return model.id; });
      newId = Math.max.apply(null, currentModelIds) + 1;
    }

    attrs.id = newId;
    this._data[dataKey].push(attrs);

    return attrs;
  },

  _updateRecord: function(type, attrs) {
    var currentModel = this.find(type, attrs.id);
    Object.keys(attrs).forEach(function(attr) {
      currentModel[attr] = attrs[attr];
    });

    return currentModel;
  },

  remove: function(key, id) {
    var _this = this;
    var dataKey = key.pluralize();

    this._data[dataKey] = this._data[dataKey].rejectBy('id', +id);
    return {};
  },

  removeQuery: function(type, query) {
    var _this = this;
    var dataKey = type.pluralize();

    Object.keys(query).forEach(function(queryKey) {
      _this._data[dataKey] = _this._data[dataKey].rejectBy(queryKey, query[queryKey]);
    });

    return {};
  }
};
