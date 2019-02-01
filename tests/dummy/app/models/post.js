import DS from 'ember-data';
import { computed } from '@ember/object';
import yaml from 'js-yaml';
import renderMarkdown from 'dummy/utils/render-markdown';
import { htmlSafe } from '@ember/string';

export default DS.Model.extend({

  comments: DS.hasMany(),

  title: DS.attr(),
  body: DS.attr(),
  issueUrl: DS.attr(),

  htmlBody: computed('body', function() {
    return htmlSafe(renderMarkdown(this.body));
  }),

  meta: computed('body', function() {
    let lines = this.body.split('\n').map(line => line.trim());
    let firstLine = lines[0];

    if (firstLine === '<!--') {
      let lastIndex = lines.indexOf('-->');
      let metaLines = lines.slice(1, lastIndex);
      let meta = yaml.safeLoad(`${metaLines.join('\n')}`);

      return meta;
    }
  }),

  slugAndId: computed('slug', 'id', function() {
    return `${this.meta.slug}-${this.id}`;
  })

});
