export default {

  define: function(type, attrs) {
    if (attrs === undefined) {
      attrs = type;
    }

    return function(sequence) {
      var newModel = {};

      Object.keys(attrs).forEach(function(key) {
        var type = typeof attrs[key];

        if (type === 'string' || type === 'number') {
          newModel[key] = attrs[key];
        } else if (type === 'function') {
          newModel[key] = attrs[key].call(attrs, sequence);
        }
      });

      return newModel;
    };
  }

};
