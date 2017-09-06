import { find, extend, omit, sortBy } from 'lodash';
import { Persons } from '../persons';
import { Orgs } from '../../organizations/organizations';
import { Memberships } from '../../memberships/memberships';
import { rankedSobOrg } from '../../memberships/server/lib';

Meteor.publish("person", function(id) {
  check(id, String);
  return Persons.find({
     $or: [ { _id: id }, { simple: id }, { name: id }, { names: id } ]
  });
});

Meteor.publish('membersOfPerson', function (id, limit) {
  check(id, String);
  check(limit, Number);

  const LIMIT = 75; // max items to return for each relationship
  const publishedKeys = {};

  const sobOrgsRanked = rankedSobOrg();

  const m = Memberships.find({
    person_id: id,
  }).map((doc) => {
    const ranked = find(sobOrgsRanked, o => (doc.sob_org === o._id));
    return extend(doc, omit(ranked, '_id'));
  });

  sortBy(m, o => (-o.count)).slice(0, LIMIT)
  .forEach((doc) => {
    if (publishedKeys[doc._id]) {
      this.changed('memberships', doc._id, doc);
    } else {
      publishedKeys[doc._id] = true;
      this.added('memberships', doc._id, doc);
    }
  });

  this.ready();
});

Meteor.publish("personWithOrgs", function(PersonId) {
  check(PersonId, String);
  var p = Persons.find(PersonId);
  var orgs = _.pluck(p.fetch()[0].organizations, 'id');
  return [
    Orgs.find({
      _id: {
        $in: orgs
      }
    }, {
      fields: {
        name: 1
      }
    }),
    p
  ];
});

Meteor.publish("persons_history", function(limit) {
  check(limit, Number);
  return Persons.find({}, {
    fields: {
      name: 1,
      updated_at: 1,
      source: 1,
      revisions: 1
    },
    limit: limit
  });
});
