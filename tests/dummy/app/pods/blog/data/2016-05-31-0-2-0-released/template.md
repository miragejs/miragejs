# Mirage 0.2.0 released

permalink: /blog/2016/05/31/0-2-0-released/

Mirage v0.2.0 has been released! Check out [the release notes](https://github.com/samselikoff/ember-cli-mirage/releases/tag/v0.2.0-beta.9) for the breaking changes and enhancements from 0.2.0-beta.9. Also see [Adolfo's script](https://blog.abuiles.com/blog/2016/05/27/upgrading-to-mirage-v0-dot-2-0-beta-dot-9-with-jscodeshift/) to help with some of the breaking changes from `beta.7` to `beta.9`.

If you're upgrading an app from 0.1.x to 0.2, be sure to read through [the 0.2.x docs](http://www.ember-cli-mirage.com/docs/v0.2.x/). When you're ready to upgrade, consult [the upgrade guide](http://www.ember-cli-mirage.com/docs/v0.2.x/upgrading/), and open an issue if the guide left something out.

---

Even though there's more work I want to do to smooth out the API in a few places, it's time to get 0.2 released. Most (if not all) of the planned changes should be backwards compatible with 0.2, so users should start using 0.2 today.

Next, I'm hoping to address two of the biggest pain points I saw during the beta series:

1. **Creating object graphs in tests.** Currently, seeding Mirage with a graph of related data looks something like this:

        let author = server.create('author');
        let post1 = server.create('post', { author });
        server.createList('comment', 10, { post: post1 });

        let post2 = server.create('post', { author });
        server.createList('comment', 5, { post: post2 });

    Two features planned for the factory layer will help with this: an `afterCreate` hook, and `traits`.

2. **Responding with has-one or many-to-many relationships in the Serializer.** Originally I was going to add a `hasAndBelongsToMany` helper to solve this, but now I think [ad hoc Serializer methods](https://github.com/samselikoff/ember-cli-mirage/issues/754) is a better short-term solution, and something I wanted to add anyway. Some folks are keen on getting this working, so hopefully it will land soon.

---

Thanks to everyone who braved the beta series, you were crucial to all the iterations on the API, and to all the amazing contributors who helped push it through!

Happy coding everyone!
