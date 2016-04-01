// jscs:disable disallowVar, requireArrayDestructuring
import _uniq from 'lodash/array/uniq';
import _flatten from 'lodash/array/flatten';

export default function(edges) {
  var nodes = _uniq(_flatten(edges));
  var cursor = nodes.length;
  var sorted = new Array(cursor);
  var visited = {};
  var i = cursor;

  var visit = function(node, i, predecessors) {

    if (predecessors.indexOf(node) >= 0) {
      throw new Error(`Cyclic dependency in properties ${JSON.stringify(predecessors)}`);
    }

    if (visited[i]) {
      return;
    } else {
      visited[i] = true;
    }

    var outgoing = edges.filter(function(edge) {
      return edge && edge[0] === node;
    });

    if (i = outgoing.length) {
      var preds = predecessors.concat(node);
      do {
        var pair = outgoing[--i];
        var child = pair[1];
        if (child) {
          visit(child, nodes.indexOf(child), preds);
        }
      } while (i);
    }

    sorted[--cursor] = node;
  };

  while (i--) {
    if (!visited[i]) {
      visit(nodes[i], i, []);
    }
  }

  return sorted.reverse();

}
