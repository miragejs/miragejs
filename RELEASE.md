Releasing Mirage

## 1. Draft a new release

Visit https://github.com/miragejs/miragejs/releases/new

## 2. Leave title blank

We'll fill this out later, because the version depends on whether there's a breaking change

## 3. Fill out the release's Description

Pull up a diff between the previous version and master. Use the URL

https://github.com/miragejs/miragejs/compare/v0.1.41...master

replacing v0.1.41 with the latest release.

With the exception of Dependabot commits, add a line item for each PR (each commit should correspond to one PR, assuming all PRs were merged via squash-and-merge).

Use one of four categories: Enhancements, Bugfixes, Docs, or Internal.

This is the hardest part of a release. For ~80%+ of commits, you should be able to just add a simple line with a link to the PR, and use the PR's Title next to the line item.

For more significant changes, add some extra notes so folks see some docs in the Release.

Here's an example of each. Note release descriptions are in markdown, so you can copy these examples for the headings + formatting.

````md
🚀 **Enhancements**

- #481 Mark Mirage as tree-shakable via sideEffects key.

  Prior to this change, Webpack (in common tools like Create React App + Vue CLI) would not tree-shake Mirage from production builds, since Mirage does indeed have side effects. However, these side effects are only relevant during development, and should not prevent Mirage from being tree-shaken from production builds.

  The `sideEffects` key is an escape hatch and can be used to tell Webpack exactly this. With this change, apps with modern build setups that use Mirage like this

  ```js
  import { Server } from "miragejs";

  if (process.env.NODE_ENV !== "production") {
    new Server();
  }
  ```

  should get all of `miragejs` automatically tree-shaken from their production builds!

🐛 **Bugfixes**

- https://github.com/miragejs/miragejs/pull/394 Add missing fixtures property to ServerConfig type definition

📝 **Docs**

- Update serializer docs

🏠 **Internal**

- Dependency updates
````

You can group all Dependabot updates into a single "- Dependency updates" line item under Internal.

## 4. Determine the new release number

If there's a breaking change, increment the middle number of the previous release:

    v0.1.41 -> v0.2.0

If not, increment the last number:

    v0.1.41 -> v0.1.42

Take note of the new version number.

## 5. Save your draft release

Leave the tag and title blank, and Save your draft release. We'll come back to it later.

## 6. Bump the package.json to the new version number

Edit the package.json file by visiting

https://github.com/miragejs/miragejs/edit/master/package.json

and edit the version to your new version (say, 0.1.42). Use "v0.1.42" as the commit message.

## 7. Go back to your draft release and publish it

Visit https://github.com/miragejs/miragejs/releases, find your release, and edit it.

Click "Choose a tag", and (making sure Target is master), type in "v0.1.42". You should see "Create new tag: v0.1.42 on publish" in the dropdown. Click it.

Now click Publish release!

You should see an Orange dot next to your latest commit on Mirage's GitHub homepage (https://github.com/miragejs/miragejs). Click on it and you can see the status of the GitHub action that's running the Travis CI tests. If all the tests pass, Travis will cut a release and publish it directly to npm.

Once the light is green, verify the latest release made it onto npm by visiting https://www.npmjs.com/package/miragejs.
