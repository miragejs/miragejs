# What is Mirage?

Mirage is a JavaScript library that lets frontend developers mock out backend APIs.

Unlike other mocking libraries, Mirage makes it easy to reproduce dynamic scenarios that are typically only possible when using a true production server.

Equipped with a Mirage server, a frontend developer can build, test, and even share a complete working Ember application without having to use or configure any backend services.

## Why?

Mirage was originally built to bring conventions to some home-grown HTTP mocking code that was getting unwieldy. It ended up proving most useful when it enabled frontend developers to work on their apps without having to rely on any local or staging backend services as part of their normal development workflow.

Since then, Mirage has focused on making it as easy as possible for Ember developers to maintain a mock server alongside their codebase.

## How it works

Mirage runs in the browser. It uses [Pretender.js](https://github.com/pretenderjs/pretender) to intercept and respond to any network requests your Ember app makes, letting you build your app as if it were talking to a real server.

In this way, you can develop and test your app against various server states without having to modify any application code.

In addition to intercepting HTTP requests, Mirage provides a mock database and helper functions that make it easy to simulate dynamic backend services.

Mirage borrows concepts from server-side frameworks like

  - **routes** to handle HTTP requests
  - a **database** and **models** for storing data and defining relationships
  - **factories** and **fixtures** for stubbing data, and
  - **serializers** for formatting HTTP responses

to make it easy to simulate production server behavior.

## Alternatives

These other libraries solve similar problems to Mirage and might be a better fit for your needs:

- [Polly.js](https://netflix.github.io/pollyjs/#/), a library for recording and replaying HTTP interactions
- [Pretender.js](https://github.com/pretenderjs/pretender), the low-level HTTP interceptor powering Mirage
- [Ember Data Factory Guy](https://github.com/danielspaniel/ember-data-factory-guy), factories for Ember apps powered by Ember Data
