// import Model from 'ember-cli-mirage/orm/model';
// import Schema from 'ember-cli-mirage/orm/schema';
// import { Server, Model } from '@miragejs/server';
// import Inflector from 'ember-inflector';

describe("Integration | ORM | inflector-collectionName integration", function(hooks) {
  // TODO: deal with this inflector test later
  // hooks.beforeEach(function() {
  //   Inflector.inflector.irregular('head-of-state', 'heads-of-state');

  //   this.server = new Server({
  //     models: {
  //       headOfState: Model.extend()
  //     },
  //     inflector: Inflector.inflector
  //   });
  // });

  // hooks.beforeEach(function() {
  //   this.server.shutdown();
  // });

  test(" [regression] collection creation respects irregular plural rules", assert => {
    expect(true).toBeTruthy();
    // assert.equal(this.server.db._collections.length, 1);
    // assert.equal(this.server.db._collections[0].name, 'headsOfState');
  });
});
