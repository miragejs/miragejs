# Ember CLI Mirage Changelog

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

Update notes: none

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
