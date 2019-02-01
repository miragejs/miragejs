import DS from 'ember-data';

export default DS.Model.extend({

  avatarUrl: DS.attr(),
  profileUrl: DS.attr(),
  username: DS.attr()

});
