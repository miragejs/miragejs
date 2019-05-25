# Installation

To install Mirage, run

```
ember install ember-cli-mirage
```

Ember should install the addon and add a `/mirage` directory to the root of your project.

Check out the {{docs-link 'upgrade guide' 'docs.getting-started.upgrade-guide'}} if you're coming from a previous version of Mirage.

## Note for Prettier users

There's an Ember CLI bug that exposes itself when using Prettier + Mirage. A longer-term fix is in the works, but for now, if you're using Prettier and install Mirage, you can either

- pin `eslint-plugin-prettier` to 2.6.0, or
- add the following to `.eslintignore`:

  ```sh
  /mirage/mirage
  ```

## Note for FastBoot users

You might expect Mirage to serve network requests made by your FastBoot app, but because Mirage runs only in the browser, it currently disables itself if your app is being served by FastBoot.

[FastBoot support](https://github.com/samselikoff/ember-cli-mirage/issues/1411) is a highly requested feature we are working on. In the meantime, you'll need to develop your FastBoot pages against a local server.

You can always bypass FastBoot page generation locally by running

```sh
FASTBOOT_DISABLED=true ember serve
```
Mirage will then run in the browser as expected, and you can develop your client app as normal.
