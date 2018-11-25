import Route from '@ember/routing/route';

export default Route.extend({

  beforeModel() {
    let { path } = this.paramsFor('not-found');

    this.get('redirects').forEach(candidate => {
      if (path === candidate.from || path === `${candidate.from}/`) {
        this.transitionTo('blog.post', candidate.to.replace('blog/', ''));
      }
    });
  },

  redirects: [
    {
      from: 'blog/2018/02/01/changing-mirages-default-linkage-data-behavior',
      to: 'blog/2018-02-01-changing-mirages-default-linkage-data-behavior'
    },
    {
      from: 'blog/2017/06/05/polymorphic-associations-and-auto-discovery-of-ember-data-models',
      to: 'blog/2017-06-05-polymorphic-associations-and-auto-discovery-of-ember-data-models'
    },
    {
      from: 'blog/2017/01/09/0-3-0-beta-series',
      to: 'blog/2017-01-09-0-3-0-beta-series'
    },
    {
      from: 'blog/2016/05/31/0-2-0-released',
      to: 'blog/2016-05-31-0-2-0-released'
    },
    {
      from: 'blog/2016/01/03/0-2-0-beta.9-released',
      to: 'blog/2016-01-03-0-2-0-beta-9-released'
    },
    {
      from: 'blog/2016/01/03/0-2-update-only-inject-schema',
      to: 'blog/2016-01-03-0-2-update-only-inject-schema'
    },
    {
      from: 'blog/2015/11/03/inside-ember-cli-mirage',
      to: 'blog/2015-11-03-inside-ember-cli-mirage'
    },
    {
      from: 'blog/2015/10/19/serializers-ready',
      to: 'blog/2015-10-19-serializers-ready'
    },
    {
      from: 'blog/2015/09/15/router-handler',
      to: 'blog/2015-09-15-router-handler'
    },
    {
      from: 'blog/2015/09/10/orm-not-ready-yet',
      to: 'blog/2015-09-10-orm-not-ready-yet'
    },
    {
      from: 'blog/2015/09/06/thoughts-on-model-attribute-formatting',
      to: 'blog/2015-09-06-thoughts-on-model-attribute-formatting'
    }
  ]
});
