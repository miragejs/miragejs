import escape from 'escape-string-regexp';

export default function(str) {
  return new RegExp(escape(str));
}
