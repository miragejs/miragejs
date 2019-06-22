import Route from "@ember/routing/route";

export default Route.extend({
  beforeModel() {
    let { path } = this.paramsFor("not-found");

    this.redirects.forEach(redirect => {
      redirect.from.forEach(candidate => {
        if (path === candidate || path === `${candidate}/`) {
          this.transitionTo("blog.detail", redirect.to.replace("blog/", ""));
        }
      });
    });
  },

  redirects: [
    {
      from: [
        "blog/2018/02/01/changing-mirages-default-linkage-data-behavior",
        "blog/2018-02-01-changing-mirages-default-linkage-data-behavior"
      ],
      to: "blog/changing-mirages-default-linkage-data-behavior-1475"
    },
    {
      from: [
        "blog/2017/06/05/polymorphic-associations-and-auto-discovery-of-ember-data-models",
        "blog/2017-06-05-polymorphic-associations-and-auto-discovery-of-ember-data-models"
      ],
      to:
        "blog/polymorphic-associations-and-auto-discovery-of-ember-data-models-1483"
    },
    {
      from: [
        "blog/2017/01/09/0-3-0-beta-series",
        "blog/2017-01-09-0-3-0-beta-series"
      ],
      to: "blog/0-3-0-beta-series-1484"
    },
    {
      from: [
        "blog/2016/05/31/0-2-0-released",
        "blog/2016-05-31-0-2-0-released"
      ],
      to: "blog/0-2-0-released-1485"
    },
    {
      from: [
        "blog/2016/01/03/0-2-0-beta.9-released",
        "blog/2016-01-03-0-2-0-beta-9-released"
      ],
      to: "blog/0-2-0-beta-9-released-1486"
    },
    {
      from: [
        "blog/2016/01/03/0-2-update-only-inject-schema",
        "blog/2016-01-03-0-2-update-only-inject-schema"
      ],
      to: "blog/0-2-update-only-inject-schema-1487"
    },
    {
      from: [
        "blog/2015/11/03/inside-ember-cli-mirage",
        "blog/2015-11-03-inside-ember-cli-mirage"
      ],
      to: "blog/inside-ember-cli-mirage-1488"
    },
    {
      from: [
        "blog/2015/10/19/serializers-ready",
        "blog/2015-10-19-serializers-ready"
      ],
      to: "blog/serializers-ready-1489"
    },
    {
      from: [
        "blog/2015/09/15/router-handler",
        "blog/2015-09-15-router-handler"
      ],
      to: "blog/router-handler-1490"
    },
    {
      from: [
        "blog/2015/09/10/orm-not-ready-yet",
        "blog/2015-09-10-orm-not-ready-yet"
      ],
      to: "blog/orm-not-ready-yet-1491"
    },
    {
      from: [
        "blog/2015/09/06/thoughts-on-model-attribute-formatting",
        "blog/2015-09-06-thoughts-on-model-attribute-formatting"
      ],
      to: "blog/thoughts-on-model-attribute-formatting-1492"
    }
  ]
});
