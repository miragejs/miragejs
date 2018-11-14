/**
  You can use this class when you want more control over your route handlers response.

  Pass the `code`, `headers` and `data` into the constructor and return an instance from any route handler.

  ```js
  import { Response } from 'ember-cli-mirage';

  this.get('/users', () => {
    return new Response(400, { some: 'header' }, { errors: [ 'name cannot be blank'] });
  });
  ```
*/
export default class Response {

  constructor(code, headers = {}, data = '') {
    this.code = code;
    this.headers = headers;
    this.data = data;
  }

  toRackResponse() {
    let { headers } = this;

    if (this.data && !headers.hasOwnProperty('Content-Type')) {
      headers['Content-Type'] = 'application/json';
    }

    return [ this.code, this.headers, this.data ];
  }

}
