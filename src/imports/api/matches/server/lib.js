//var  dice = require('clj-fuzzy').metrics.dice
import fuzzy from 'clj-fuzzy';

var _nearest = function(string, array) {
  // get nearest in array to string
  var graph = array.map(function(title) {
    return {
      title: title,
      score: fuzzyDicer(string, title)
    }
  })

  // return entry with highest score
  return _.result(_.find(graph, function(obj) {
    return obj.score === _.max(_.pluck(graph, 'score'));
  }), 'title');
}

fuzzyDicer = function(a, b) {
  // get distance between a and b
  return fuzzy.metrics.dice(a.toLowerCase(), b.toLowerCase())
}

compare = function(string, titles) {
  // compares string with array of possible matches
  // update page title to match that indicated by csv2mw
  var nearest = _nearest(string, titles);
  // show diff between nearest and page title
  var update = {
    title: (typeof nearest !== 'undefined') ? nearest : string,
    diff: cdiff(string, nearest)
  }
  var index = titles.indexOf(nearest)
  titles.splice(index, 1) // do not repeat in duplicates
    // TODO create user action to update page name(s)
  var duplicates = [];
  _.each(titles, function(title) {

    // if page is duplicate, i.e. not just have text in body
    if (fuzzyDicer(title.toLowerCase().trim(), string.toLowerCase().trim()) >
      8) {
      // show differences between duplicates and title
      var duplicate = {
        title: nearest,
        diff: cdiff(string, title)
      }
      duplicates.push(duplicate);
    }
  })

  return [update, duplicates]
}

cdiff = function(a, b) {
  // diff by character
  var diff = JsDiff.diffChars(a, b);
  var chars = [];
  diff.forEach(function(part) {
    // green for additions, red for deletions
    // grey for common parts
    var color = part.added ? 'text-success' :
      part.removed ? 'text-danger' : 'text-muted';
    var span = {};
    span.color = color;
    span.value = part.value;
    chars.push(span);
  });
  return chars;
}

ldiff = function(a, b) {
  // diff by line
  var diff = jsdiff.diffTrimmedLines(a, b);
  diff.forEach(function(part) {
    // green for additions, red for deletions
    // grey for common parts
    var color = part.added ? 'green' :
      part.removed ? 'red' : 'white';
    process.stderr.write(part.value[color]);
  });
  console.log()
}
