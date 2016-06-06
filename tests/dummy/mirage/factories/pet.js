import Mirage from 'ember-cli-mirage';

const names = ['Rex', 'Toby', 'Sam', 'Andy', 'Lassie', 'Annibal', 'Spark'];

export default Mirage.Factory.extend({
  alive: true,

  name(i) {
    return names[i % names.length];
  }
});
