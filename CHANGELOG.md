# Ember CLI Mirage Changelog

In general, it's good to run `ember g ember-cli-mirage` after upgrading.

## 0.2.1

Update notes:

  - None

Changes:

  - [ENHANCEMENT] Ensure mirage tree is linted @rwjblue
  - [FEATURE] #762 adds `afterCreate` to factories @seanpdoyle, @samselikoff
  - [BUGFIX] #769 ensure embedded collection keys are dynamic @arnodirlam

## 0.2.0

Update notes:

  - The `inverseOf` options was renamed to `inverse`, to be consistent with Ember Data

Changes:

  - [BREAKING CHANGE] #640 `inverseOf` was renamed to `inverse` @samselikoff
  - [FEATURE] #729 Add `this.normalizedRequestAttrs` helper method to function route handler @samselikoff
  - [ENHANCEMENT] #743 Ensure associations can be passed in during model creation @samselikoff
  - [BUGFIX] #738 Ensure directory location can be configured @gthmb
  - General cleanup, updates and docs @lizzerdrix, @timjcook, @samselikoff

## 0.2.0-beta.9

This release contains some breaking changes from 0.2.0-beta.8.

Update notes:

  - Schema model classes are now pluralized. They used to be singularized, taking after Rails' conventions, but I think it's better to match our db conventions (e.g. `db.users`).

  So you'll need to change

  ```js
  schema.user.all()
  schema.user.find(1)
  ```

  to

  ```js
  schema.users.all()
  schema.users.find(1)
  ```

  and so on. The upgrade should be a relatively straightforward.

  - Breaking changes on ORM/Collection:

    - There's now a `.models` property on Collections, which gives you access to the underlying JavaScript array. This should be used if you want to munge the collection using Lodash, Ramda et al.

    ```js
    let usersCollection = schema.users.all();
    let uniqueUsers = _.uniq(usersCollection.models, u => u.firstName);
    ```

    - Collection no longer attempts to mimic an array. This turned out to be confusing, since you can't really subclass arrays in JavaScript, and it would sometimes be compatible with functions that operate on arrays, but sometimes not.

    So, you can no longer use the array accessor on a collection, meaning the following won't work:

    ```js
    let authors = schema.authors.all();

    // The following no longer work
    authors[1];
    authors.length;
    authors.push(model);
    authors.map(f);
    authors.forEach(f);
    authors.reduce(f);
    authors.toArray(); // use authors.models instead
    ```

    Instead, if you need to use array-methods on `Collections`, access the `.models` property. You can always convert your transformed array back to a `Collection`, for example to tell Mirage to serialize your response:

    ```js
    import { Collection } from 'ember-cli-mirage';

    let authors = schema.authors.all().models;
    let topPosts = authors.map(a => a.topPost);

    return new Collection('post', topPosts);
    ```

Changes:

  - [BREAKING CHANGE] #705 Drop Collection.[], add Collection.models @samselikoff
  - [BREAKING CHANGE] #705 Pluralize Schema class names @samselikoff
  - [FEATURE] #705 Add this.serialize to function route handlers @samselikoff
  - [ENHANCEMENT] Server.create falls back to Models if Factories don't exist @samselikoff
  - [ENHANCEMENT] Support aliases for --proxy @elbeezy
  - [ENHANCEMENT] Do not include files if on Fastboot @locks
  - [BUGFIX] #709 Fix Serializer include logic @cibernox
  - [BUGFIX] #666 Ensure model serializers are used for JSONAPI @samselikoff
  - General cleanup, updates and docs @lizzerdrix, @lependu, @amyrlam, @blimmer, @noslouch, @bgentry, @mitchlloyd, @BrianSipple, @acorncom, @stefanpennar

## 0.2.0.beta-8

Update notes:

Changes:

  - [FEATURE] #622 Add `links` method to JSONAPISerializer @richmolj
  - [FEATURE] #655 Add importable rest-serializer @rondale-sc
  - [FEATURE] #269 Dynamic factory attributes can reference other dynamic attributes @lazybensch
  - [FEATURE] #603 Support inverse foreign keys @ef4
  - [ENHANCEMENT] #323 Extract startMirage from initializer @mitchlloyd
  - [ENHANCEMENT] #617 JSON:API Serializer includes intermediate relationships when using dot paths @RSSchermer
  - [ENHANCEMENT] #610 Allow Mirage to be a dependency of another addon @donovan-graham
  - General cleanup and updates @lolmaus, @samselikoff

## 0.2.0.beta-7

Update notes: none.

Changes:

 - [BUGFIX] #602 Fix regression in Db IdentityManager @samselikoff

## 0.2.0.beta-6

Update notes: None.

Changes:

 - [BUGFIX] #585 Ensure DB autoincrement ids account for string ints @samselikoff
 - [BUGFIX] #592 GET shorthands 404s for nonexistant singular resources @samselikoff

## 0.2.0.beta-5

Update notes: None.

Changes:

 - [ENHANCEMENT] Allow files to be excluded from non-prodution builds Danail Nachev
 - [ENHANCEMENT] #552 Add default passthroughs @anulman
 - [ENHANCEMENT] #427 Factories return models @ef4
 - [ENHANCEMENT] #561 Ensure foreign keys are picked up in shorthands @abuiles
 - [ENHANCEMENT] #546 Add named associations @samselikoff
 - [BUGFIX] #548 Shorthands can read ID from json:api request body @lkhaas
 - General cleanup and updates @ef4 @abuiles @elwayman02

## 0.2.0.beta-4

Update notes: None.

Changes:

 - [ENHANCEMENT] #501 Adds ModelClass.first @lependu
 - [BUGFIX] #543 Ensure Mirage works within Addons @cibernox
 - [BUGFIX] #535 Include original message on rethrow errors @hamled
 - [BUGFIX] #515 Ensure serializer#serialize always receives request @2468ben
 - [BUGFIX] #506 Ensure serializer#normalize looks up model-specific serializers @2468ben
 - [BUGFIX] #507 Ensure foreign keys are added once @samselikoff
 - General cleanup @bekzod, @alecho, @koriroys, @cibernox

## 0.2.0.beta-3

Update notes:

  - There was a bug where dasherized multiword serializers and fixtures were not registered correctly. This has been fixed, so if you happen to have camelized multiword serializers or fixtures

        /mirage/serializers/blogPost.js
        /mirage/fixtures/blogPosts.js

    you can rename these to dasherized names

        /mirage/serializers/blog-post.js
        /mirage/fixtures/blog-posts.js

    In Mirage 0.2, all filenames should be dasherized, following the conventions of Ember CLI. If you ever encounter a situation where this doesn't work, please file an issue, as this is a bug.

Changes:  

  - [ENHANCEMENT] Better blueprints
  - [BUGFIX] Ensure multiword dasherized serializers work #333
  - [BUGFIX] Ensure multiword dasherized fixtures work

## 0.2.0.beta-2

Update notes:
  - `Serializer#relationships` was renamed to `Serializer#include`.

  Before:

  ```
  export default Serializer.extend({
    relationships: ['comments']
  });
  ```

  After:

  ```
  export default Serializer.extend({
    include: ['comments']
  });
  ```

  - We now use `destroyApp` test helper in Ember-CLI to shutdown the Mirage server after each test to resolve a memory leak reported in #226. It's important to run `ember g ember-cli-mirage` when upgrading to take advantage of this fix.
  - Inserting records with numerical IDs that have already have been used will throw an error per changes from #417
  - `model.type` was renamed to `model.modelName`, and is dasherized (instead of camelized)

Changes:
  - [BREAKING CHANGE] POST and PUT shorthands require a Serializer#normalize function, and will transform your attrs to camelCase. (If you're using JsonApiSerializer or ActiveModelSerializer, this is done for you). To keep using the db yourself, write custom POST and PUT route handlers.
  - [BREAKING CHANGE] Serializer#relationships was renamed to Serializer#include #424 @lolmaus
  - [BREAKING CHANGE] Change `model.type` to `model.modelName`, ensure it's dasherized #454
  - [BREAKING CHANGE] Inserting records with numerical IDs that have already have been used will throw an per changes from #417
  - [BREAKING CHANGE] DB stores ids as strings #462 @jherdman
  - [BREAKING CHANGE] GET shorthand with single owner and many children throws an error.
  - [BREAKING CHANGE] Arrays in shorthands should always contain singularzied model names (e.g. dasherized)
  - [FEATURE] Add `?include` query param support in JSONAPISerializer @lolmaus
  - [FEATURE] Add `build` & `buildList` to factories #459 @ballpointpenguin
  - [ENHANCEMENT] JSONAPISerializer defaults to dasherized types and relationships (and other JSONAPI enhancements) @lolmaus
  - [ENHANCEMENT] shutdown Mirage server on destroyAppp @blimmer
  - [ENHANCEMENT] createList perf enhancement @alvinvogelzang
  - [ENHANCEMENT] improve DB autoincrement @jherdman
  - [ENHANCEMENT] #493 Ability to set timing parameter for individual routes @bekzod
  - [FEATURE] [Allow nested factory objects](https://github.com/samselikoff/ember-cli-mirage/commit/a73a195c1b991d226429ee369e2af688a95c7d95) @john-kurkowski
  - Other bugfixes/enhancements @jherdman, @ef4, @seanpdoyle, @alecho, @bekzod

## 0.2.0.beta-1

Update notes:
  - Move `/app/mirage` to `/mirage`

Changes:
  - [FEATURE] ORM, Serializers
  - [ENHANCEMENT] @heroiceric
  - [BREAKING CHANGE] missing routes will now throw an Error instead of logging to the Logger's `error` channel.

## 0.1.11

Update notes: none

Changes:
  - [BUGFIX]

## 0.1.10

Update notes: none

Changes:
  - [BUGFIX]

## 0.1.9

Update notes:
  - When this library first came out, you defined routes using `this.stub('get', '/path'...)` in your `mirage/config.js` file. `stub` has been removed, so if you happen to be using it, just replace those calls with the `this.get`, `this.post`, etc. helper methods.
  - If you happen to be using the orm (it's private + not ready yet), know that there were some changes to how the data is stored. Contact me if you want to upgrade.

Changes:
  - [BREAKING CHANGE] remove #stub from Server (see update note) @samselikoff
  - [FEATURE] add `.passthrough` API @samselikoff
  - [FEATURE] add `.loadFixtures` API @samselikoff
  - [FEATURE] add .random.number.range to faker @iamjulianacosta
  - [IMPROVEMENT] better missing route message @blimmer
  - [IMPROVEMENT] upgrade Ember CLI 1.13.8 @blimmer
  - [IMPROVEMENT] improve logging @gaborsar
  - [IMPROVEMENT] cleanup @jherdman
  - [BUGFIX] fixup blueprints @samsinite
  - [BUGFIX] fix ie8 bug @jerel
  - [BUGFIX] avoid dep warning in Ember 2.x @mixonic


## 0.1.8

Update notes: none

Changes:
  - [BUGFIX] remove console.log from server.js

## 0.1.7

Update notes:
  - We use `ember-inflector` from NPM now, so after upgrading you should remove `ember-inflector` from your bower.json.

Changes:
  - [ENHANCEMENT] Add support for fully qualified domain name @jamesdixon
  - [IMPROVEMENT] upgrade Ember CLI, Pretender 0.9 @cibernox @blimmer
  - [IMPROVEMENT] use ember-inflector from NPM @alexlafroscia @eptis
  - [IMPROVEMENT] note requirement of .bind @brettchalupa

## 0.1.6

Update notes:
  - If you happened to be manipulating db objects using object references instead of the db API, e.g.

    ```
    let contact = db.contacts.find(1);
    contact.name = 'Gandalf';
    ```

    this will no longer work, as the db query methods now return copies of db data. This was considered a private API. You'll need to use the db api (e.g. `db.update`) to make changes to db data.

Changes:
  - [ENHANCEMENT] add PATCH to mirage @samselikoff
  - [ENHANCEMENT] update Faker to 3.0, expose all methods @blimmer
  - [ENHANCEMENT] add basics of orm layer @samselikoff
  - [IMPROVEMENT] general refactorings @makepanic @cibernox

## 0.1.5

Update notes: none

Changes:
  - [BUGFIX] fixtures bug @bantic
  - [BUGFIX] jshint on blueprint files @dukex
  - [BUGFIX] allow beta to break build @bantic

## 0.1.4

Update notes:
  - If you run the generator to update deps, the blueprint will put a file under `/scenarios/default.js`. The presence of this file will mean your fixtures will be ignored during development. If you'd still like to use your fixtures, delete the `/scenarios` directory.

Changes:
  - [IMPROVEMENT] factory-focused initial blueprints

## 0.1.3

Update notes: none

Changes:
  - [ENHANCEMENT] #29 add faker + list helpers @mupkoo
  - [IMPROVEMENT] upgrade ember cli to 0.2.7 @blimmer
  - [BUGFIX] #167 allow ids of 0 @samselikoff

## 0.1.2

- empty release

## 0.1.1

Update notes: none

Changes:
  - [IMPROVEMENT] remove unrelated folders from npm @mupkoo
  - [BUGFIX] allow testConfig to be optional @samselikoff

## 0.1.0

Update notes: none

Changes:
  - [ENHANCEMENT] Ability to use factories to seed development database @g-cassie
  - [ENHANCEMENT] Ability to specify test-only Mirage routes @cball
  - [BUGFIX] `db.where` now coerces query params to string @cibernox
  - [BUGFIX] #146 fix es6 template bug with blueprint

## 0.0.29

Update notes: none

Changes:
  - [BUGFIX] fix url with slash before ? @knownasilya

## 0.0.28

Update notes: none

Changes:
  - [ENHANCEMENT] 'coalesce' option to support GET multiple ids @cibernox
  - [ENHANCEMENT] #117 db.find supports array of ids @samselikoff
  - [BUGFIX] #115 IE8 safe @samselikoff
  - [BUGFIX] can remove collection then add records again @seawatts
  - [IMPROVEMENT] automatically add server to .jshint @bdvholmes
  - [IMPROVEMENT] use lodash.extend instead of jQuery.extend @seawatts
  - [IMPROVEMENT] use 200 HTTP code if responseBody exists @cibernox
  - [IMPROVEMENT] better logging @bdvholmes

## 0.0.27

Update notes: none

Changes:
  - [IMPROVEMENT] remove `tmp` dir from git @ahmadsoe
  - [BUGFIX] ensure string ids that start with ints can be used @cibernox

## 0.0.26

Update notes: none.

Changes:
  - [ENHANCEMENT] #70 Allow function route handler to customize status
    code, HTTP headers and data. See [the
wiki](https://github.com/samselikoff/ember-cli-mirage/wiki/HTTP%20Verb%20function%20handler#dynamic-status-codes-and-http-headers)
for details.
  - [BUGFIX] #81 Include assets in dev build, in case users visit /tests
    from `ember s`.
  - [BUGFIX] smarter id coercion in controller @mikehollis
  - [IMPROVEMENT] import mergeTrees and funnel @willrax @cibernox
  - [IMPROVEMENT] better status code lookup @cibernox
  - [IMPROVEMENT] use ember-try @willrax

## 0.0.25

  - npm is hard :(

## 0.0.24

Update notes: The config options `force` or `disable` aren't support anymore, please use `enabled` as explained here: https://github.com/samselikoff/ember-cli-mirage/wiki/Configuration#enabled

Changes:
  - [BREAKING CHANGE] There's no more `force` or `disable` option, simply specify

        ENV['ember-cli-mirage'].enabled = [true|false]

    in whichever environment you need to override the default behavior.

  - [ENHANCEMENT] #51 Adds generators: `ember g factory contact` and `ember g fixture contacts`
  - [ENHANCEMENT] Allow response logging in tests via `server.logging = true`
  - [BUGFIX] #66 ignore query params in shorthands

## 0.0.23
Update notes: None.

Change:

 - #53 allow arbitrary factory attrs
 - #50 do not use Mirage if /server/proxies dir exists
 - load fixtures in test environment if no factories exist

## 0.0.22
Update notes:
  - Rename your `/app/mirage/data` directory to `/app/mirage/fixtures`.
  - Move your `/tests/factories` directory to `/app/mirage/factories`.
  - `store`, the data cache your routes interact with, has been renamed to `db` and its API has changed.

    Your shorthand routes should not be affected, but you'll need to update any routes where you passed in a function and interacted with the store.See [the wiki entry](../../wiki/Database) for more details, and the new API.

Changes:

 - [BREAKING CHANGE] Rename `/data` directory to `/fixtures`.
 - [BREAKING CHANGE] Move `/tests/factories` directory to `app/mirage/factories`
 - #41 [BREAKING CHANGE] Renamed `store` to `db`, and changed API. See [the wiki entry](../../wiki/Database).
 - #42 [ENHANCEMENT] Add ability to change timing within tests, e.g. to test the UI on long delays.
 - #6 [ENHANCEMENT] Add ability to force an error response from a route.
 - [ENHANCEMENT] Return POJO from route
 - [BUGFIX] ignore assets if Mirage isn't being used

## 0.0.21
Update notes:

This project has been renamed from ember-pretenderify to ember-cli-mirage. Please update your `package.json` dependency accordingly, and
 - rename the `/app/pretender` dir to `/app/mirage`
 - if you have factories, change

        import EP from 'ember-pretenderify';

    to

        import Mirage from 'ember-cli-mirage';

Changes:

 - #26 [ENHANCEMENT] Added support for factory inheritance
 - #36 [BUGFIX] Fix bug where createList didn't respect attr overrides @ashton
 - #37 [INTERNAL] Add tests for createList @cibernox
 - #35 [INTERNAL] Return [] from store#findAll

## 0.0.20

- Deprecation notice for new name.

## 0.0.19
Hotfix for #34, no changes require to update.

## 0.0.18
Update notes:
  - the testing API has changed. Before, you used `store.loadData`, now you use factories. See the Getting Started guide below for an example, or the factories wiki page for the full API.

Changes:
  - Basic factory support

## 0.0.17
Update notes:
  - the testing API has changed. Before, you added data directly to `serverData`, e.g.

        serverData.contacts = [{id: 1, name: 'Link'}];

    Now, use the store directly:

        store.loadData({
          contacts: [{id: 1, name: 'Link'}]
        });

  - `this` in your config file no longer refers to the Pretender instance; use `this.pretender` instead.

Changes:
  - [FEATURE] you can use `this.get`, `this.post`, `this.put` and `this.del` instead of `this.stub(verb)` now
  - bug fixes + refactoring

## 0.0.16
Update notes: None.

Changes:
  - *actually* fix bower package version of inflector

## 0.0.15
Update notes: None.

Changes:
  - fix bower package version of inflector

## 0.0.14
Update notes: None.

Changes:
 - clean up [string].pluralize calls

## 0.0.13
Update notes:

 - Run `bower install`. This brings along `ember-inflector` as a separate package.
 - This update contained one or more breaking changes (see below).

Changes:

- [breaking change] If you happen to be using `store.find(type)` to return a collection (e.g. without an `id`), use `store.findAll(type)` instead
- Various updates/refactorings to store
- Don't log server responses during testing
- Use standalone ember-inflector package, no more dependency on ember data

## 0.0.12
Update notes:
  - Before, the following was part of the install:

    *Testing*

    In your `tests/helpers/start-app.js`,

    ```js
    import pretenderifyTesting from '../../ember-pretenderify/testing';

    export default function startApp(attrs) {
      ...

      pretenderifyTesting.setup(application);

      return application;
    }
    ```

    You no longer need this code, so just delete it all from the `start-app` file. The server will automatically instantiate via the initializer during tests.

Changes:

- fixed bug with stub#delete (so it works more than once. hah.)
- instantiate server in initializer
