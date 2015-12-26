import Ember from 'ember';

export default function destroyApp(application) {
  Ember.run(function() {
    application.destroy();

    server.shutdown();
  });
}
