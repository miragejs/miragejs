export default function () {
  var items = arguments.length > 0 ? arguments : [];

  return function (i) {
    return items[i % items.length];
  };
}
