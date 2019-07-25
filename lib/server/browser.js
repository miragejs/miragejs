/* eslint no-console: 0 */

import Pretender from "pretender";
import assert from "../assert";
import BaseServer from "./base";

/**
  The Mirage server.

  Note that `this` within your config function in `mirage/config.js` refers to the server instance, which is the same instance that `server` refers to in your tests.

  @class BrowserServer
  @public
*/
export default class BrowserServer extends BaseServer {
  /**
   * Creates a new Pretender instance.
   *
   * @method createPretender
   * @return {Object} A new Pretender instance.
   * @public
   */
  createPretender() {
    let server = this;
    return new Pretender(
      function() {
        this.passthroughRequest = function(verb, path, request) {
          if (server.shouldLog()) {
            console.log(
              `Passthrough request: ${verb.toUpperCase()} ${request.url}`
            );
          }
        };

        this.handledRequest = function(verb, path, request) {
          if (server.shouldLog()) {
            console.groupCollapsed(
              `Mirage: [${request.status}] ${verb.toUpperCase()} ${request.url}`
            );
            let { requestBody, responseText } = request;
            let loggedRequest, loggedResponse;

            try {
              loggedRequest = JSON.parse(requestBody);
            } catch (e) {
              loggedRequest = requestBody;
            }

            try {
              loggedResponse = JSON.parse(responseText);
            } catch (e) {
              loggedResponse = responseText;
            }

            console.log({
              request: loggedRequest,
              response: loggedResponse,
              raw: request
            });
            console.groupEnd();
          }
        };

        this.unhandledRequest = function(verb, path) {
          path = decodeURI(path);
          assert(
            `Your Ember app tried to ${verb} '${path}', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file. Did you forget to add your namespace?`
          );
        };
      },
      { trackRequests: server.shouldTrackRequests() }
    );
  }
}
