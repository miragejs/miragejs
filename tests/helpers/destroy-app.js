import Ember from 'ember';

const { run } = Ember;

export default function destroyApp(application) {
  run(function() {
    application.destroy();

    server.shutdown();
  });
}
