# Changing Mirage's default linkage data behavior in 0.4 to better conform to JSON:API's semantics

I wanted to write a quick post detailing a change that happened in Mirage's 0.4.0 release that I originally didn't signal as a breaking change, but that affected more apps than I realized.

I have since added the following note about it to the [0.3 -> 0.4 upgrade guide]({{ site.baseurl }}{% link docs/v0.4.x/upgrading.md %})
, and I'm reposting it here for more visibility. I think it's worth understanding, as the issue sheds light on the semantics around some of JSON:API's design decisions.

Apologies if you upgraded to 0.4 and had to debug this yourself!

---

There is one primary change in 0.4 that could break your 0.3 app.

In 0.3.x, Mirage's JSONAPISerializer included all related foreign keys whenever serializing a model or collection, even if those relationships were not being `included` in the payload.

This actually goes against JSON:API's design. Foreign keys in the payload are known as [Resource Linkage](http://jsonapi.org/format/#document-resource-object-linkage) and are intended to be used by API clients to link together all resources in a JSON:API compound document. In fact, most server-side JSON:API libraries do not automatically serialize all related foreign keys, and only return linkage data for related resources when they are being included in the current document.

By including linkage data for every relationship in 0.3, it was easy to develop Ember apps that would work with Mirage but would behave differently when hooked up to a standard JSON:API server. Since Mirage always included linkage data, an Ember app might automatically be able to fetch related resources using the ids from that linkage data plus its knowledge about the API. For example, if a `post` came back like this:

```js
// GET /posts/1
{
  data: {
    type: 'posts',
    id: '1',
    attributes: { ... },
    relationships: {
      author: {
        data: {
          type: 'users',
          id: '1'
        }
      }
    }
  }
}
```

and you forgot to `?include=author` in your GET request, Ember Data would potentially use the `user:1` foreign key and lazily fetch the `author` by making a request to `GET /authors/1`. This is problematic because

1. This is not how foreign keys are intended to be used
2. It'd be better to see no data and fix the problem by going back up to your data-loading code and add `?include=author` to your GET request, or
3. If you do want your interface to lazily load the author, use resource `links` instead of the resource linkage `data`:

```js
// GET /posts/1
{
  data: {
    type: 'posts',
    id: '1',
    attributes: { ... },
    relationships: {
      author: {
        links: {
          related: '/api/users/1'
        }
      }
    }
  }
}
```

Resource links can be defined on Mirage serializers using the [links](http://www.ember-cli-mirage.com/docs/v0.3.x/serializers/#linksmodel) method (though `including` is likely the far more simpler and common approach to fetching related data).

So, Mirage 0.4 changed this behavior and by default, the JSONAPISerializer only includes linkage data for relationships that are being included in the current payload (i.e. within the same compound document).

This behavior is configurable via the `alwaysIncludeLinkageData` key on your JSONAPISerializers. It is set to `false` by default, but if you want to opt-in to 0.3 behavior and always include linkage data, set it to `true`:

```js
// mirage/serializers/application.js
import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  alwaysIncludeLinkageData: true
});
```

If you do this, I would recommend looking closely at how your real server behaves when serializing resources' relationships and whether it uses resource `links` or resource linkage `data`, and to update your Mirage code accordingly to give you the most faithful representation of your server.
