# Ember Pretenderify Changelog

## 0.0.13

Changes:

- [breaking change] If you happen to be using `store.find(type)` to return a collection (e.g. without an `id`), start using `store.findAll(type)`
- various updates/refactorings to store

## 0.0.12
To update,
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
