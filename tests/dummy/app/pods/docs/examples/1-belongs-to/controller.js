import Controller from '@ember/controller';
import Server from 'ember-cli-mirage/server';
import { Model, belongsTo } from 'ember-cli-mirage';
import { computed } from '@ember/object';

export default Controller.extend({

  init() {
    this._super(...arguments);

    let server = new Server({
      pretender: true,
      models: {
        // BEGIN-SNIPPET 1-belongs-to-schema
        author: Model.extend(),

        book: Model.extend({
          author: belongsTo()
        })
        // END-SNIPPET
      }
    });

    // BEGIN-SNIPPET 1-belongs-to
    let author = server.create('author', {
      name: 'Neal Stephenson'
    });

    server.create('book', {
      author,
      title: 'Cryptonomicon'
    });
    // END-SNIPPET

    this.set('server', server);
  },

  dbDump: computed('server', function() {
    let json = this.get('server').db.dump();

    return JSON.stringify(json, null, 2);
  })

});
