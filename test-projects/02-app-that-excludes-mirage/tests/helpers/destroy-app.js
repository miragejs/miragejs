import { run } from '@ember/runloop';

export default function destroyApp(application) {
  run(function() {
    application.destroy();

    if (window.server) {
      server.shutdown();
    }
  });
}
