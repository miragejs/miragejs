# Overriding dependencies

Mirage has several dependencies it relies on to function, including [Pretender.js](https://github.com/pretenderjs/pretender), a [fetch polyfill](https://github.com/github/fetch), and others.

If you find yourself in a situation where you need specific features from any of these dependencies, but the version currently bundled with Mirage does not have those features, you have a few options:

1. Submit a PR to Mirage upgrading its version of that dependency, and wait until that PR gets merged.

2. Add the version of the dependency you want to your own project's `package.json` file, and use [yarn resolutions](https://yarnpkg.com/lang/en/docs/selective-version-resolutions/) to ensure that only that version of the dependency ends up in your build.

  If you do this, be aware that Mirage may not function properly if it relies on an API that changed between its bundled version and the version you specified. The only way to know for sure is to test your application using the new bundle.

---

If you'd like to read more about the general problem of overriding transitive dependencies, check out {{#docs-link 'blog.detail' 'how-to-reliably-override-npm-dependencies-1497'}}this blog post{{/docs-link}}.
