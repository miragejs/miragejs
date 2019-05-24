# Opening an issue

Stack Overflow is the best place for general questions on how to use the library. Use the `ember-cli-mirage` tag.

It's best to ask a question with an attached Twiddle that demonstrates your bug/question. Use the [Mirage Boilerplate Twiddle](https://ember-twiddle.com/eedfd390d8394d54d5bfd0ed988a5d0f) to reproduce your issue.

# Contributing to Ember CLI Mirage

## Docs development

The documentation site is built using [Ember CLI AddonDocs](https://ember-learn.github.io/ember-cli-addon-docs/), which means it is the Ember app located in the `tests/dummy` folder of this addon.

If you're just making a change to a single page in the docs, look for the "Edit this page" link at the bottom of that page. Click on that and propose your edits.

To make more substantial changes, you'll want to be able to develop the docs site locally. To run an AddonDocs site,

```shell
git clone git@github.com:samselikoff/ember-cli-mirage.git
cd ember-cli-mirage
yarn install # (or npm install)
ember s
```

You should be able to visit `localhost:4200` and see the docs site running locally. Now checkout a new branch, make your changes, and submit a PR!


## Mirage development

To help out with Mirage development, first pull down the project locally and verify that all tests on `master` are passing.

```
git clone git@github.com:[your-name]/ember-cli-mirage.git
cd ember-cli-mirage
yarn install # (or npm install)
ember test
```

If all tests pass, you should be all set. Checkout a new branch to start developing, then submit a PR when you're ready!
