/*
  An identity map.
*/
export default {

  loadData: function(data, key) {
    this._data = this._data || {};

    if (key) {
      this._data[key] = data;
    } else {
      this._data = data;
    }
  },

  find: function(key, id) {
    key = key.pluralize();
    var data;
    var query;

    // Coerce to int if is int
    id = parseInt(id, 10) || id;

    if (this._data && this._data[key]) {
      data = this._data[key].findBy('id', id);
    }

    // if (id) {
    //   if (this._data) {
    //     if (this._data[key]) {
    //       data = this._data[key].findBy('id', +id);

    //     } else {
    //       data = null;
    //     }
    //   } else {
    //     data = null;
    //   }
    // } else {
    //   data = this._data ? (this._data[key] ? this._data[key] : []) : [];
    // }

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
    var data = this._data[key];
    key = key.pluralize();

    if (data) {
      Object.keys(query).forEach(function(queryKey) {
        data = data.filterBy(queryKey, query[queryKey]);
      });
    }

    return data;
  },

  push: function(key, attrs) {
    var data = {};
    var dataKey = key.pluralize();

    // Updating
    if (attrs.id) {
      var currentModel = this.find(key, +attrs.id);
      Object.keys(attrs).forEach(function(attr) {
        currentModel[attr] = attrs[attr];
      });

      data[key] = currentModel;

    // Creating
    } else {

      var currentModels = this._data[dataKey];

      var newId = 1;
      if (currentModels.length) {
        var currentModelIds = currentModels.map(function(model) { return model.id; });
        newId = Math.max.apply(null, currentModelIds) + 1;
      }

      attrs.id = newId;
      this._data[dataKey].push(attrs);
      data[key] = attrs;
    }

    return data;
  },

  remove: function(key, id) {
    var _this = this;
    var dataKey = key.pluralize();

    if (typeof id === 'object') {
      var query = id;
      Object.keys(query).forEach(function(queryKey) {
        _this._data[dataKey] = _this._data[dataKey].rejectBy(queryKey, query[queryKey]);
      });

    } else {
      this._data[dataKey] = this._data[dataKey].rejectBy('id', +id);

    }

    return {};
  }
};
