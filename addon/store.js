/*
  An identity map.
*/
export default {

  loadData: function(data, key) {
    this.data = this.data || {};

    if (key) {
      this.data[key] = data;
    } else {
      this.data = data;
    }
  },

  find: function(key, id) {
    key = key.pluralize();
    var data;
    var query;

    if (typeof id === 'object') {
      query = id;

      data = this.data[key];
      Object.keys(query).forEach(function(queryKey) {
        data = data.filterBy(queryKey, query[queryKey]);
      });

    } else {

      if (id) {
        if (this.data) {
          key = key.pluralize();

          if (this.data[key]) {
            data = this.data[key].findBy('id', +id);

          } else {
            data = null;
          }
        } else {
          data = null;
        }
      } else {
        data = this.data ? (this.data[key] ? this.data[key] : []) : [];
      }
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

      var currentModels = this.data[dataKey];

      var newId = 1;
      if (currentModels.length) {
        var currentModelIds = currentModels.map(function(model) { return model.id; });
        newId = Math.max.apply(null, currentModelIds) + 1;
      }

      attrs.id = newId;
      this.data[dataKey].push(attrs);
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
        _this.data[dataKey] = _this.data[dataKey].rejectBy(queryKey, query[queryKey]);
      });

    } else {
      this.data[dataKey] = this.data[dataKey].rejectBy('id', +id);

    }

    return {};
  }
};
