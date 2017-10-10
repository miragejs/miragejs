# Overview

Nearly all Ember apps interact with an API. When you reach the point during development where you need to work with dynamic server data, you have a few options:

  1. Proxy your app's HTTP requests to a local or hosted version of your actual backend, if it exists
  2. Use a library like [Pretender](https://github.com/trek/pretender) or [jQuery mockjax](https://github.com/jakerella/jquery-mockjax) to write a custom script that intercepts your requests in the client
  3. Use Ember CLI's HTTP mocks

Option 1 can work if you already have the API, but often that isn't the case. And even if it is, development and testing often requires server state that differs from the live API. Option 2 is flexible, but requires you to start from scratch in each project, leaving it up to you to enforce conventions across your apps. Option 3 has a bit more structure, but requires a node server to be running, and doesn't allow you to use your fake server in a CI environment.

Mirage was built to solve these problems. It's a fake server that runs in the client, and can be used in both development and testing. It brings along enough conventions to quickly get you up and running.

Mirage borrows concepts from typical backend systems like

  - **routes**
  - a **database** and **models**, for storing data and defining relationships
  - **factories** and **fixtures**, for stubbing data
  - **serializers**, for formatting responses

Once you define your server, developing and testing your Ember app is a breeze. Read on to learn more!
