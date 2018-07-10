function Filter(opts) {
  this.operator = opts.operator;
  this.expected = opts.expected;
  this.property = opts.property;
  this.modifier = null;
  this.flow = "actived";
}

Filter.prototype.closed = function(value) {
  if (value === false) return this;
  var closedFilter = new Filter(this);
  closedFilter.flow = "closed";
  return closedFilter;
};

Filter.prototype.bypassed = function(value) {
  if (value === false) return this;
  var bypassedFilter = new Filter(this);
  bypassedFilter.flow = "bypassed";
  return bypassedFilter;
};

Filter.prototype.actived = function(value) {
  if (value === false) return this;
  var activedFilter = new Filter(this);
  activedFilter.flow = "actived";
  return activedFilter;
};

Filter.prototype.not = function(value) {
  if (value === false) return this;
  var notFilter = new Filter(this);
  notFilter.modifier = "not";
  return notFilter;
};

Filter.prototype.applyFilter = function(value) {
  if (this.flow === "closed") return false;
  if (this.flow === "bypassed") return true;
  var result = null;
  var a = value;
  var b = this.expected;
  switch (this.operator) {
    case "eq":
      result = a == b;
      break;
    case "equ":
      result = a.toLowerCase() == b.toLowerCase();
      break;
    case "fn":
      result = b(a);
      break;
    default:
      result = true;
  }

  let finalResult;
  switch (this.modifier) {
    case "not":
      finalResult = !result;
      break;
    default:
      finalResult = result;
  }
  return finalResult;
}

module.exports = Filter;