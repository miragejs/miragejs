import Route from '@ember/routing/route';

export default Route.extend({

  beforeModel() {
    let pathname = window.location.pathname;
    [
      "v0.0.27",
      "v0.0.28",
      "v0.0.29",
      "v0.1.x",
      "v0.2.x",
      "v0.3.x",
      "v0.4.x"
    ].forEach(version => {
      console.log(version);
      console.log(pathname);
      if (pathname.match(`/docs/${version}`)) {
        window.location = pathname.replace(`/docs/${version}`, `/versions/${version}`);
      }
    });
  }

});
