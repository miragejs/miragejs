export default {

  Factory: {
    define: function(type, attrs) {
      if (attrs === undefined) {
        attrs = type;
      }

      return function(n) {
        var newModel = {};

        Object.keys(attrs).forEach(function(key) {
          newModel[key] = attrs[key];
        });

        return newModel;
      };
    }
  }

};
