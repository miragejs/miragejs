# Contributing to Ember CLI Mirage

To help out with Mirage development, first pull down the project locally and verify that all tests on `master` are passing.

1. Fork `ember-cli-mirage`, then create a local clone of your fork:

    ```
    git clone git@github.com:[your-name]/ember-cli-mirage.git
    cd ember-cli-mirage
    ```
    
2. Ensure `node` is installed. I use version 4.2.x, the LTS release.
  - Ensure `npm` is installed
3. Ensure `ember-cli` is installed: `npm install -g ember-cli`
4. Ensure `phantomjs` v2.x is installed.
5. Install dependencies and run the tests:

    ```
    npm i && bower i
    ember test
    ```

If all tests pass, you should be all set. Checkout a new branch to start developing, then submit a PR when you're ready!
