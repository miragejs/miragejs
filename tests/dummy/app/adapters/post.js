import $ from "jquery";
import { Promise } from "rsvp";
import DS from "ember-data";

const BASE_URL = "https://api.github.com/repos/samselikoff/ember-cli-mirage";

export default DS.JSONAPIAdapter.extend({
  findRecord(store, type, id, snapshot) {
    let url = `${BASE_URL}/issues/${id}`;

    return new Promise((resolve, reject) => {
      $.getJSON(url).then(
        json => {
          let jsonApiDocument = {
            data: {
              id,
              type: "posts",
              attributes: {
                title: json.title,
                body: json.body,
                "issue-url": json.html_url
              },
              relationships: {
                comments: {
                  links: {
                    related: json.comments_url
                  }
                }
              }
            }
          };

          resolve(jsonApiDocument);
        },
        jqXHR => {
          reject(jqXHR);
        }
      );
    });
  },

  findAll(store, type) {
    let url = `${BASE_URL}/issues?state=closed&labels=Blog%20post`;

    return new Promise((resolve, reject) => {
      $.getJSON(url).then(
        json => {
          this.hasLoadedAllPosts = true;

          let jsonApiDocument = {
            data: json.map(obj => ({
              id: obj.number,
              type: "posts",
              attributes: {
                title: obj.title,
                body: obj.body,
                "issue-url": obj.html_url
              }
            }))
          };

          resolve(jsonApiDocument);
        },
        jqXHR => {
          reject(jqXHR);
        }
      );
    });
  },

  shouldReloadAll(store, snapshotArray) {
    return !this.hasLoadedAllPosts;
  },

  findHasMany(store, snapshot, url, relationship) {
    return new Promise((resolve, reject) => {
      $.getJSON(url).then(
        json => {
          let jsonApiDocument = { data: [], included: [] };
          let includedUserHash = {};

          json.forEach(obj => {
            jsonApiDocument.data.push({
              id: obj.id,
              type: "comments",
              attributes: {
                body: obj.body,
                permalink: obj.html_url,
                "created-at": obj.created_at
              },
              relationships: {
                user: {
                  data: { type: "users", id: obj.user.id }
                }
              }
            });

            includedUserHash[obj.user.id] = obj.user;
          });

          Object.keys(includedUserHash).forEach(key => {
            let user = includedUserHash[key];
            jsonApiDocument.included.push({
              type: "users",
              id: user.id,
              attributes: {
                "avatar-url": user.avatar_url,
                "profile-url": user.html_url,
                username: user.login
              }
            });
          });

          resolve(jsonApiDocument);
        },
        jqXHR => {
          reject(jqXHR);
        }
      );
    });
  }
});
