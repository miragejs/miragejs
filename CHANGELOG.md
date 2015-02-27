# Ember Pretenderify Changelog

## 0.0.20
Update notes: none.

Changes:

 - #26 [ENHANCEMENT] Added support for factory inheritance
 - #36 [BUGFIX] Fix bug where createList didn't respect attr overrides @ashton
 - #37 [INTERNAL] Add tests for createList @cibernox
 - #35 [INTERNAL] Return [] from store#findAll

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
