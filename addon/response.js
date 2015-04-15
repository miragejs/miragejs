export default function(code, headers, data) {
  this.toArray = function() {
    return [code, headers, data];
  };

  return this;
}
