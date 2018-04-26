# Opening an issue

Stack Overflow is the best place for general questions on how to use the library. Use the `ember-cli-mirage` tag.

It's best to ask a question with an attached Twiddle that demonstrates your bug/question. Use the [Mirage Boilerplate Twiddle](https://ember-twiddle.com/eedfd390d8394d54d5bfd0ed988a5d0f) to reproduce your issue.

# Contributing to Ember CLI Mirage

## Docs development

If you're just making a change to a single page in the docs, you can simply use GitHub's interface. Find the relevant doc and click "Edit".

To make more substantial changes, you'll want to be able to write locally. The docs are a [Jekyll](https://jekyllrb.com/) site. Once you have Ruby, Bundler and Jekyll installed,

1. Fork `ember-cli-mirage` on GitHub, then create a local clone of your fork:

    ```
    git clone git@github.com:[your-name]/ember-cli-mirage.git
    cd ember-cli-mirage
    ```
    
2. Checkout the `gh-pages` branch:

    ```
    git checkout gh-pages
    ```
    
3. Start the Jekyll build:

    ```
    bundle install
    bundle exec jekyll serve --watch --baseurl ''
    ```
    
You should be able to visit `localhost:4000` and see the docs site running locally. Now checkout a new branch, make your changes, and submit a PR!


## Mirage development

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
