import {
  find,
  extend,
  omit,
  sortBy
} from 'lodash';
import {
  Orgs
} from '../../organizations/organizations';
import {
  Persons
} from '../../persons/persons';
import {
  rankedSobOrg,
} from './lib';
import Memberships from "../memberships.js"

function selector(id) {
  return {
    $or: [{
        _id: id
      },
      {
        simple: id
      },
      {
        names: id
      },
      {
        name: id
      },
    ]
  }
}

function publicator(self, doc, collection, published) {
  if (published[doc._id]) {
    self.changed(collection, doc._id, doc);
  } else {
    published[doc._id] = true;
    self.added(collection, doc._id, doc);
  }
}

Meteor.publish('sharesOfEntity', function(id, collectionName) {
  check(id, String);
  check(collectionName, String);
  const LIMIT = 75; // max items to return for each relationship
  const self = this;
  const publishedKeys = {};

  Meteor.defer(() => {
    // FIXME howto check if this defer actually helps
    const sobOrgsRanked = rankedSobOrg();

    let entity = Orgs.findOne(selector(id));
    if (collectionName === 'persons') {
      entity = Persons.findOne(selector(id));
    }

    const shares = entity.shares().map((doc) => {
      const ranked = find(sobOrgsRanked, o => (doc.sob_org === o._id));
      return extend(doc, omit(ranked, '_id'));
    });
    sortBy(shares, o => (-o.count)).slice(0, LIMIT)
    .forEach((doc) => (publicator(self, doc, 'memberships', publishedKeys)));
  });

  this.ready();
});


Meteor.publish('memberships', function(id) {
  check(id, String);
  const LIMIT = 75; // max items to return for each relationship

  return Memberships.find({
    $or:
    [
      {person_id: id},
      {sob_org: id}
    ]
  }, {limit: LIMIT})

});
