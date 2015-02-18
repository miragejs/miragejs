export default {
  define: function(type, attrs) {
    if (attrs === undefined) {
      attrs = type;
    }

    return function(sequence) {
      var newModel = {};

      // Sort attrs
      var basicAttrKeys = Object.keys(attrs)
        .filter(function(key) {
          var type = typeof attrs[key];
          return type === 'string' || type === 'number';
        });
      var functionAttrKeys = Object.keys(attrs)
        .filter(function(key) {
          return typeof attrs[key] === 'function';
        });

      // First, get plain attrs
      basicAttrKeys.forEach(function(key) {
        newModel[key] = attrs[key];
      });

      // Then, execute functions
      functionAttrKeys.forEach(function(key) {
        newModel[key] = attrs[key].call(newModel, sequence);
      });

      return newModel;
    };
  }
};
