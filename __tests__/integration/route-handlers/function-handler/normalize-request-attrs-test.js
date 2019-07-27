
import { Model, ActiveModelSerializer } from "@miragejs/server";
import Server from "@miragejs/server/server";
import promiseAjax from "../../../helpers/promise-ajax";

describe(
  "Integration | Route handlers | Function handler | #normalizedRequestAttrs",
  () => {
    let server; beforeEach(() => {
      server = new Server({
        environment: "development",
        models: {
          user: Model.extend({}),
          fineComment: Model.extend({})
        },
        serializers: {
          application: ActiveModelSerializer
        }
      });
      server.timing = 0;
      server.logging = false;
    });

    afterEach(() => {
      server.shutdown();
    });

    test(`it returns an object with the primary resource's attrs and belongsTo keys camelized`, async () => {
      assert.expect(1);

      server.post("/users", function() {
        let attrs = normalizedRequestAttrs();

        expect(attrs).toEqual({
          firstName: "Sam",
          lastName: "Selikoff",
          teamId: 1
        });

        return {};
      });

      await promiseAjax({
        method: "POST",
        url: "/users",
        contentType: "application/json",
        data: JSON.stringify({
          user: {
            first_name: "Sam",
            last_name: "Selikoff",
            team_id: 1
          }
        })
      });
    });

    test(`it works for compound names`, async () => {
      assert.expect(1);

      server.post("/fine-comments", function() {
        let attrs = normalizedRequestAttrs();

        expect(attrs).toEqual({
          shortText: "lorem ipsum"
        });

        return {};
      });

      await promiseAjax({
        method: "POST",
        url: "/fine-comments",
        contentType: "application/json",
        data: JSON.stringify({
          fine_comment: {
            short_text: "lorem ipsum"
          }
        })
      });
    });

    test(`it shows a meaningful error message if it cannot infer the modelname from the URL`, async () => {
      assert.expect(1);

      server.post("/users/create", function() {
        normalizedRequestAttrs();
      });

      assert.rejects(
        promiseAjax({ method: "POST", url: "/users/create" }),
        function(ajaxError) {
          return (
            ajaxError.xhr.responseText.indexOf(
              `the detected model of 'create' does not exist`
            ) > -1
          );
        }
      );
    });

    test(`it accepts an optional modelName if it cannot be inferred from the path `, async () => {
      assert.expect(1);

      server.post("/users/create", function() {
        let attrs = normalizedRequestAttrs("user");

        expect(attrs).toEqual({
          firstName: "Sam",
          lastName: "Selikoff",
          teamId: 1
        });

        return {};
      });

      await promiseAjax({
        method: "POST",
        url: "/users/create",
        contentType: "application/json",
        data: JSON.stringify({
          user: {
            first_name: "Sam",
            last_name: "Selikoff",
            team_id: 1
          }
        })
      });
    });

    test(`it errors if the optional parameter is camelized for a model with a compount name`, async () => {
      assert.expect(1);

      server.post("/fine-comments/create", function() {
        normalizedRequestAttrs("fineComment");
      });

      assert.rejects(
        promiseAjax({ method: "POST", url: "/fine-comments/create" }),
        function(ajaxError) {
          return (
            ajaxError.xhr.responseText.indexOf(
              `You called normalizedRequestAttrs('fineComment'), but normalizedRequestAttrs was intended to be used with the dasherized version of the model type. Please change this to normalizedRequestAttrs('fine-comment')`
            ) > 0
          );
        }
      );
    });

    test(`it works with a form encoded request that has a lower-case content-type (issue 1398)`, async () => {
      assert.expect(1);

      server.post("/form-test", function() {
        // Easiest way I could figure out to change the capitalization of the Content-Type header. Tried
        // to do this from the Ajax side but jquery kept capitalizing the header.
        request.requestHeaders[
          "content-type"
        ] = request.requestHeaders["Content-Type"];
        delete request.requestHeaders["Content-Type"];

        let attrs = normalizedRequestAttrs("user");

        expect(attrs).toEqual({
          name: "Sam Selikoff",
          company: "TED",
          email: "sam.selikoff@gmail.com"
        });

        return {};
      });

      await promiseAjax({
        method: "POST",
        url: "/form-test",
        data: "name=Sam+Selikoff&company=TED&email=sam.selikoff@gmail.com"
      });
    });
  }
);
