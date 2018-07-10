const Filter = require('./filters.js');

function MathSet(obj) {
  this.SetObject = obj || {};
  this.indexes = {};
}

MathSet.prototype.get = function(key) {
  return this.SetObject[key];
};

MathSet.prototype.set = function(key, value) {
  return this.SetObject[key] = value;
};

MathSet.prototype.toObject = function() {
  return this.SetObject;
};

MathSet.prototype.indexBy = function(property) {
  var propertyBreadcrumb = property.split(".");
  var thisSet = this.SetObject;

  this.indexes[property] = [];
  for (var i in thisSet) {
    var cursor = thisSet[i];
    for (var p in propertyBreadcrumb) {
      var index = propertyBreadcrumb[p];
      cursor = cursor[index];
    }
    if (this.indexes[property][cursor] === undefined) this.indexes[property][cursor] = [];
    this.indexes[property][cursor].push({
      key: i,
      value: thisSet[i]
    });
  }

  return this.SetObject;
};

MathSet.prototype.filter = function(paramFilters) {
  var filters = [];
  for (var a = 0; a < arguments.length; a++) {
    var paramFilters = arguments[a];
    filters = filters.concat(paramFilters instanceof Filter ? [paramFilters] : paramFilters);
  }
  var thisSet = this.SetObject;
  var resultSet = {};

  for (var f in filters) {
    var filter = filters[f];
    var propertyBreadcrumb = filter.property.split(".");
    for (var i in thisSet) {
      var cursor = thisSet[i];
      for (var p in propertyBreadcrumb) {
        var index = propertyBreadcrumb[p];
        cursor = cursor[index];
      }
      if (filter.applyFilter(cursor)) {
        resultSet[i] = thisSet[i];
      }
    }
  }
  return new MathSet(resultSet);
};

MathSet.prototype.serialFilter = function(paramFilters) {
  var filters = [];
  for (var a in arguments) {
    var paramFilters = arguments[a];
    filters = filters.concat(paramFilters instanceof Filter ? [paramFilters] : paramFilters);
  }

  var filteredSet = this;

  for (var f in filters) {
    var filter = filters[f];
    filteredSet = filteredSet.filter(filter);
  }
  return filteredSet;
};

MathSet.prototype.count = function() {
  return Object.keys(this.SetObject).length;
};

MathSet.prototype.countByFilterProperty = function(filter) {
  var property = filter.property;
  var propertyBreadcrumb = property.split(".");
  var thisSet = this.SetObject;

  var count = [];
  for (var i in thisSet) {
    var cursor = thisSet[i];
    for (var p in propertyBreadcrumb) {
      var index = propertyBreadcrumb[p];
      cursor = cursor[index];
    }
    if (count[cursor] === undefined) count[cursor] = 0;
    count[cursor]++;
  }

  return count;
};

MathSet.prototype.indexedByOriginalKey = function() {
  var thisSet = this.SetObject;
  var resultSet = {};
  for (var i in thisSet) {
    var elements = thisSet[i];
    for (var el in elements) {
      var element = elements[el];
      resultSet[element.key] = element.value;
    }
  }
  return resultSet;
};


/* SETS OPERATIONS */

/* UnionBy */
MathSet.prototype.unionBy = function(property, newSet) {
  try {
    var indexedThisSet = this.indexes[property];
  } catch (err) {
    throw ("You have to define the '" + property + "' index before call unionBy");
    return this;
  }
  newSet = newSet instanceof MathSet ? newSet : new MathSet(newSet);
  newSet.indexBy(property);
  var indexedNewSet = newSet.indexes[property];

  var indexedResultSet = {};


  for (var i in indexedThisSet) {
    indexedResultSet[i] = indexedThisSet[i];
  }

  for (var i in indexedNewSet) {
    indexedResultSet[i] = indexedNewSet[i];
  }
  indexedResultSet = new MathSet(indexedResultSet);

  var resultSet = indexedResultSet.indexedByOriginalKey();
  return new MathSet(resultSet);
};

/* Union */
MathSet.prototype.union = function(newSet) {
  newSet = newSet instanceof MathSet ? newSet.SetObject : newSet;
  var resultSet = {};
  var thisSet = this.SetObject;
  for (var i in thisSet) {
    resultSet[i] = thisSet[i];
  }
  for (var i in newSet) {
    resultSet[i] = newSet[i];
  }
  return new MathSet(resultSet);
};

/* Intersection */
MathSet.prototype.intersection = function(newSet) {
  newSet = newSet instanceof MathSet ? newSet.SetObject : newSet;
  var resultSet = {};
  var thisSet = this.SetObject;
  for (var i in thisSet) {
    if (newSet.hasOwnProperty(i)) {
      resultSet[i] = newSet[i];
    }
  }
  return new MathSet(resultSet);
};

/* Difference */
MathSet.prototype.difference = function(newSet) {
  newSet = newSet instanceof MathSet ? newSet.SetObject : newSet;
  var resultSet = {};
  var thisSet = this.SetObject;
  for (var i in thisSet) {
    resultSet[i] = thisSet[i];
  }
  for (var i in newSet) {
    delete resultSet[i];
  }
  return new MathSet(resultSet);
};

/* Complement */
MathSet.prototype.complement = function(newSet) {
  newSet = newSet instanceof MathSet ? newSet.SetObject : newSet;
  var resultSet = {};
  var thisSet = this.SetObject;
  for (var i in newSet) {
    if (!thisSet.hasOwnProperty(i)) {
      resultSet[i] = newSet[i];
    }
  }
  return new MathSet(resultSet);
};

/* Symmetric Difference */
MathSet.prototype.symmetricDifference = function(newSet) {
  newSet = newSet instanceof MathSet ? newSet.SetObject : newSet;
  var thisSet = this;
  var union = thisSet.union(newSet);
  var intersection = thisSet.intersection(newSet);
  var resultSet = intersection.complement(union).SetObject;
  return new MathSet(resultSet);
};

MathSet.prototype.log = function() {
  var text = "{ " + Object.keys(this.toObject()).join(" , ") + " }";
  console.log(text);
};

module.exports = MathSet;
