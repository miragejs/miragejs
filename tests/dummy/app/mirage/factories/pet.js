import Mirage from 'ember-cli-mirage';

var names = ['Rex', 'Toby', 'Sam', 'Andy', 'Lassie', 'Annibal', 'Spark'];

export default Mirage.Factory.extend({
  alive: true,

  name: function(i) {
    return names[i%names.length];
  },
});
