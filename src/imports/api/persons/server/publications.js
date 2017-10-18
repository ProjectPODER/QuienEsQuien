import { find, extend, omit, sortBy } from 'lodash';
import { Persons } from '../persons';
import { Orgs } from '../../organizations/organizations';
import { rankedSobOrg } from '../../memberships/server/lib';
import {
  rankedDependencies,
} from '../../contracts/server/lib';

function publicator(self, doc, collection, published) {
  if (published[doc._id]) {
    self.changed(collection, doc._id, doc);
  } else {
    published[doc._id] = true;
    self.added(collection, doc._id, doc);
  }
}

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

Meteor.publish("person", function(id) {
  check(id, String);
  return Persons.find(selector(id));
});

Meteor.publish('boardMembershipsOfPerson', function (id) {
  check(id, String);

  const self = this;
  const LIMIT = 75; // max items to return for each relationship
  const publishedKeys = {};
  const sobOrgsRanked = rankedSobOrg();
  const person = Persons.findOne(selector(id));

  const board = person.board().map((doc) => {
    const ranked = find(sobOrgsRanked, o => (doc.sob_org === o._id));
    return extend(doc, omit(ranked, '_id'));
  });

  sortBy(board, o => (-o.count)).slice(0, LIMIT)
  .forEach((doc) => (publicator(self, doc, 'memberships', publishedKeys)));

  this.ready();
});

Meteor.publish('postsOfPerson', function(id) {
  check(id, String);

  const LIMIT = 75; // max items to return for each relationship
  const self = this;
  const publishedKeys = {};
  const sobOrgsRanked = rankedSobOrg();
  const person = Persons.findOne(selector(id));

  const posts = person.posts().map((doc) => {
    const ranked = find(sobOrgsRanked, o => (doc.person_id === o._id));
    return extend(doc, omit(ranked, '_id'));
  });
  sortBy(posts, o => (-o.count)).slice(0, LIMIT)
  .forEach((doc) => (publicator(self, doc, 'memberships', publishedKeys)));

  this.ready();
});

Meteor.publish('contractsSuppliedByPerson', function(id) {
  check(id, String);

  const LIMIT = 75; // max items to return for each relationship
  const self = this;
  const publishedKeys = {};
  const person = Persons.findOne(selector(id));
  // contracts Supplied
  const contractsSupplied = person.contractsSupplied();
  if (contractsSupplied.count() > 0) {
    const dependenciesRanked = rankedDependencies();

    contractsSupplied.forEach((doc, i) => {
      if (i > LIMIT) return;

      const ranked = find(dependenciesRanked, o => (doc.dependency === o._id));
      const publish = extend(doc, omit(ranked, '_id'));
      return publicator(self, publish, 'contracts', publishedKeys);
    });
  }

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
