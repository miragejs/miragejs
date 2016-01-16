import DS from 'ember-data';

export default DS.Model.extend({

  title: DS.attr(),

  wordSmith: DS.belongsTo()

});
