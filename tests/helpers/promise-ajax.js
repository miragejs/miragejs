import { Promise } from "rsvp";
import $ from "jquery";

export default options => {
  return new Promise((resolve, reject) => {
    $.ajax(options)
      .done((data, status, xhr) => resolve({ data, status, xhr }))
      .fail((xhr, status, error) => reject({ xhr, status, error }));
  });
};
