import DS from "ember-data";
import compileMarkdown from "ember-cli-addon-docs/utils/compile-markdown";
import { htmlSafe } from "@ember/string";
import { computed } from "@ember/object";

export default DS.Model.extend({
  user: DS.belongsTo(),

  body: DS.attr(),
  permalink: DS.attr(),
  createdAt: DS.attr(),

  htmlBody: computed("body", function() {
    return htmlSafe(compileMarkdown(this.body));
  })
});
