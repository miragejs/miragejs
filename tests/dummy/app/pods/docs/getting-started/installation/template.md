# Installation

To install Mirage, run

```
ember install ember-cli-mirage
```

Ember should install the addon and add a `/mirage` directory to the root of your project.

Check out the [upgrade guide](../upgrading) if you're coming from Mirage 0.2.x.

**Note for Prettier users**

There's an Ember CLI bug that exposes itself when using Prettier + Mirage. A longer-term fix is in the works, but for now, if you're using Prettier and install Mirage, you can either

- pin `eslint-plugin-prettier` to 2.6.0, or
- add the following to `.eslintignore`:

  ```sh
  /mirage/mirage
  ```
