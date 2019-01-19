import Controller from '@ember/controller';
import Server from 'ember-cli-mirage/server';
import { Model, hasMany } from 'ember-cli-mirage';
import { computed } from '@ember/object';

export default Controller.extend({

  init() {
    this._super(...arguments);

    let server = new Server({
      pretender: true,
      models: {
        // BEGIN-SNIPPET 2-has-many-schema
        author: Model.extend({
          books: hasMany()
        }),

        book: Model.extend()
        // END-SNIPPET
      }
    });

    // BEGIN-SNIPPET 2-has-many
    let book = server.create('book', {
      title: 'Cryptonomicon'
    });

    server.create('author', {
      name: 'Neal Stephenson',
      books: [ book ]
    });
    // END-SNIPPET

    this.set('server', server);
  },

  dbDump: computed('server', function() {
    let json = this.get('server').db.dump();

    return JSON.stringify(json, null, 2);
  })

});
