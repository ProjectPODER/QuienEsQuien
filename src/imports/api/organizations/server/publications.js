import { map, find, extend, omit, sortBy } from 'lodash';
import { Orgs } from '../organizations';
import { Persons } from '../../persons/persons';
import { Memberships } from '../../memberships/memberships';
import { rankedOrgId, rankedSobOrg, rankedPersonId } from '../../memberships/server/lib';
import { Contracts } from '../../contracts/contracts';

Meteor.publish('org', function(_id) {
  check(_id, String);
  return Orgs.find({
     $or: [ { _id: _id} , { simple: _id }, { name: _id }, { names: _id} ]
  });
});

Meteor.publish('membersOfOrganization', function(id, limit) {
  check(id, String);
  check(limit, Number);
  const LIMIT = 75; // max items to return for each relationship
  const publishedKeys = {};

  const sobOrgsRanked = rankedSobOrg();
  const orgIdRanked = rankedOrgId();
  const personIdRanked = rankedPersonId();

  const m1 = Memberships.find({
    role: 'shareholder',
    sob_org: id,
  }).map((doc) => {
    const ranked = find(orgIdRanked, o => (doc.org_id === o._id));
    return extend(doc, omit(ranked, '_id'));
  });
  sortBy(m1, o => (-o.count)).slice(0, LIMIT)
  .forEach((doc) => {
    if (publishedKeys[doc._id]) {
      this.changed('memberships', doc._id, doc);
    } else {
      publishedKeys[doc._id] = true;
      this.added('memberships', doc._id, doc);
    }
  });

  const m2 = Memberships.find({
    role: 'shareholder',
    org_id: id,
  }).map((doc) => {
    const ranked = find(sobOrgsRanked, o => (doc.sob_org === o._id));
    return extend(doc, omit(ranked, '_id'));
  });

  sortBy(m2, o => (-o.count)).slice(0, LIMIT)
  .forEach((doc) => {
    if (publishedKeys[doc._id]) {
      this.changed('memberships', doc._id, doc);
    } else {
      publishedKeys[doc._id] = true;
      this.added('memberships', doc._id, doc);
    }
  });

  const m3 = Memberships.find({
    department: 'board',
    sob_org: id,
  }).map((doc) => {
    const ranked = find(personIdRanked, o => (doc.person_id === o._id));
    return extend(doc, omit(ranked, '_id'));
  });

  sortBy(m3, o => (-o.count)).slice(0, LIMIT)
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

Meteor.publish("orgs_history", function(limit) {
  check(limit, Number)
  return Orgs.find({}, {
    fields: {
      description_data: 1,
      updated_at: 1,
      source: 1,
      revisions: 1
    },
    limit: limit
  });
});

Meteor.publish("orgWithMembers", function(OrgId) {
  check(OrgId, String);
  var org = Orgs.find(OrgId);
  var members = map(org.fetch()[0].memberships, 'name');
  return [
    Persons.find({
      name: {
        $in: members
      }
    }, {
      fields: {
        name: 1
      }
    }),
    org
  ];

});

Meteor.publish("files", function() {
  return Files.find();
});
