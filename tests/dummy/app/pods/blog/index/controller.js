import Controller from '@ember/controller';

export default Controller.extend({

  posts: [
    {
      date: 'February 1, 2018',
      title: `Changing Mirage's default linkage data behavior in 0.4 to better conform to JSON:API's semantics`,
      slug: '2018-02-01-changing-mirages-default-linkage-data-behavior'
    },
    {
      date: 'June 5, 2017',
      title: `Polymorphic associations and auto-discovery of Ember Data models`,
      slug: '2017-06-05-polymorphic-associations-and-auto-discovery-of-ember-data-models'
    },
    {
      date: 'January 9, 2017',
      title: `Mirage 0.3.0 beta series`,
      slug: '2017-01-09-0-3-0-beta-series'
    },
    {
      date: 'May 31, 2016',
      title: `Mirage 0.2.0 released`,
      slug: '2016-05-31-0-2-0-released'
    },
    {
      date: 'May 13, 2016',
      title: `Mirage 0.2.0-beta.9 released`,
      slug: '2016-01-03-0-2-0-beta-9-released'
    },
    {
      date: 'January 3, 2016',
      title: `Mirage 0.2 update`,
      slug: '2016-01-03-0-2-update-only-inject-schema'
    },
    {
      date: 'November 3, 2015',
      title: `Video: Inside Ember CLI Mirage`,
      slug: '2015-11-03-inside-ember-cli-mirage'
    },
    {
      date: 'October 19, 2015',
      title: `Serializers are ready for testing`,
      slug: '2015-10-19-serializers-ready'
    },
    {
      date: 'September 15, 2015',
      title: `Refactoring Server, adding a Route Handler object`,
      slug: '2015-09-15-router-handler'
    },
    {
      date: 'September 10, 2015',
      title: `The ORM is not ready, yet`,
      slug: '2015-09-10-orm-not-ready-yet'
    },
    {
      date: 'September 6, 2015',
      title: `Thoughts on model attribute formatting`,
      slug: '2015-09-06-thoughts-on-model-attribute-formatting'
    }
  ]

});
