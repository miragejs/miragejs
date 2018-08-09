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
