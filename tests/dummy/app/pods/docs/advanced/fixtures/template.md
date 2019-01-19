# Fixtures

Fixtures are data files that can be used to seed your database, either during development or within tests. In general Mirage recommends using factories over fixtures, though there are times where fixtures are suitable.

To add data to a database table `countries`, for instance, first create the file `mirage/fixtures/countries.js`:

```js
// mirage/fixtures/countries.js
export default [
  {id: 1, name: 'United States'},
  {id: 2, name: 'Canada'},
  {id: 3, name: 'Mexido'},
  ...
];
```

Fixture filenames are always plural, and export arrays of POJOs.

To load this fixture file into our database during development, we can use the `loadFixtures` API in our `scenarios/default.js` file:

```js
// mirage/scenarios/default.js
export default function(server) {
  server.loadFixtures('countries');
}
```

We can also call `server.loadFixtures()` (with no arguments) to have all defined fixture files loaded into the database.

Similarly, we can call `loadFixtures` from within a test to load this data into our database:

```js
test('I can see the countries', function() {
  server.loadFixtures('countries');

  visit('/');

  andThen(function() {
    equal( find('select.countries option').length, 100 );
  });
});
```

See the `server.loadFixtures` API docs for more information.
