import { Orgs } from './organizations.js';
import { Persons } from '../persons/persons.js';
import { map } from 'lodash';
import { extend } from 'lodash';
import { find } from 'lodash';
import { unionBy } from 'lodash';
import { filter } from 'lodash';

membershipsArray = function membershipsArray(array) {
  var names = map(array, 'name');
  var p = Persons.find({
    name: {
      $in: names
    }
  }).fetch();
  p.map(function(person) {
    person.id = person._id;
    return extend(person, find(array, ['name',
      person.name
    ]))
  });
  var un = unionBy(p, array, 'name');
  return un
}

ownedByArray = function ownedByArray(array) {
  var names = map(array, 'name');
  var o = Orgs.find({
    name: {
      $in: names
    }
  }, {
    fields: {
      name: 1
    }
  }).map(function(doc) {
    return extend(doc, find(array, ['name', doc.name]))
  });
  return unionBy(o, array, 'name');
}

competitorsArray = function(array) {
  var names = map(array, 'name');
  var o = Orgs.find({
    name: {
      $in: names
    }
  }, {
    fields: {
      name: 1
    }
  }).map(function(doc) {
    return extend(doc, find(array, ['name', doc.name]))
  });
  return unionBy(o, array, 'name');
}

ownsArray = function ownsArray(name, array) {
  // get suborgs of origin node w/ mongo find
  // all orgs where orgin exists in the owned_by array
  // (those orgs which are suborganizations of this one)

  var firstRun = Orgs.find({
    name: {
      $in: map(array, 'name')
    }
  }, {
    fields: {
      name: 1
    }
  }).map(function(doc) {
    return extend(doc, find(array, ['name', doc.name]))
  });

  var secondRun = Orgs.find({
    'owned_by.name': name
  }, {
    fields: {
      name: 1
    }
  }).fetch();
  return filter(unionBy(firstRun, secondRun, array, 'name'), function(
    doc) {
    return (doc.name !== name)
  });

}
