import Route from "@ember/routing/route";

export default Route.extend({
  model({ post_slug_and_id }) {
    let matches = post_slug_and_id.match(/\d+$/);
    if (!matches) {
      let path = document.location.pathname.replace(/^\/|\/$/g, "");
      this.transitionTo("not-found", path);
    }

    let postId = matches[0];

    return this.store.findRecord("post", postId);
  }
});
