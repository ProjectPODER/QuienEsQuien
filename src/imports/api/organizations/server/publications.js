import {
  map,
  find,
  extend,
  omit,
  sortBy
} from 'lodash';
import {
  Orgs
} from '../organizations';
import {
  Persons
} from '../../persons/persons';
import {
  rankedOrgId,
  rankedPersonId,
} from '../../memberships/server/lib';
import {
  rankedDependencies,
  rankedSuppliersOrg,
  rankedSuppliersPerson,
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

Meteor.publish('org', function(_id) {
  check(_id, String);
  return Orgs.find(selector(_id));
});

Meteor.publish('boardMembersOfOrganization', function(id) {
  check(id, String);

  const LIMIT = 75; // max items to return for each relationship
  const self = this;
  const publishedKeys = {};
  const personIdRanked = rankedPersonId();
  const org = Orgs.findOne(selector(id));

  // board
  const board = org.board().map((doc) => {
    const ranked = find(personIdRanked, o => (doc.person_id === o._id));
    return extend(doc, omit(ranked, '_id'));
  });
  sortBy(board, o => (-o.count)).slice(0, LIMIT)
  .forEach((doc) => (publicator(self, doc, 'memberships', publishedKeys)));

  this.ready();
});

Meteor.publish('postsOfOrganization', function(id) {
  check(id, String);

  const LIMIT = 75; // max items to return for each relationship
  const self = this;
  const publishedKeys = {};
  const personIdRanked = rankedPersonId();
  const org = Orgs.findOne(selector(id));

  const posts = org.posts().map((doc) => {
    const ranked = find(personIdRanked, o => (doc.person_id === o._id));
    return extend(doc, omit(ranked, '_id'));
  });
  sortBy(posts, o => (-o.count)).slice(0, LIMIT)
  .forEach((doc) => (publicator(self, doc, 'memberships', publishedKeys)));

  this.ready();
});

Meteor.publish('shareHoldersOfOrganization', function(id) {
  check(id, String);

  const LIMIT = 75; // max items to return for each relationship
  const self = this;
  const publishedKeys = {};
  const personIdRanked = rankedPersonId();
  const orgIdRanked = rankedOrgId();
  const org = Orgs.findOne(selector(id));

  // shareholders
  org.shareholders().forEach((doc, i) => {
    if (i > LIMIT) return
    if (doc.person_id) {
      const ranked = find(personIdRanked, o => (doc.person_id === o._id));
      const publish = extend(omit(doc), omit(ranked, '_id'));
      return publicator(self, publish, 'memberships', publishedKeys);
    }
    const ranked = find(orgIdRanked, o => (doc.org_id === o._id));
    const publish = extend(omit(doc), omit(ranked, '_id'));
    return publicator(self, publish, 'memberships', publishedKeys);
  });

  this.ready();
});

Meteor.publish('contractsSuppliedByOrganization', function(id) {
  check(id, String);

  const LIMIT = 75; // max items to return for each relationship
  const self = this;
  const publishedKeys = {};
  const org = Orgs.findOne(selector(id));
  console.time('pub');

  // contracts Supplied
  const contractsSupplied = org.contractsSupplied();
  if (contractsSupplied.count() > 0) {
    const dependenciesRanked = rankedDependencies();
    contractsSupplied.forEach((doc, i) => {
      if (i > LIMIT) return;
      const ranked = find(dependenciesRanked, o => (doc.dependency === o._id));
      const publish = extend(doc, omit(ranked, '_id'));
      return publicator(self, publish, 'contracts', publishedKeys);
    });
  }
  console.timeEnd('pub');

  this.ready();
});

Meteor.publish('contractsSolicitedByOrganization', function(id) {
  check(id, String);

  const LIMIT = 75; // max items to return for each relationship
  const self = this;
  const publishedKeys = {};
  console.time('pub');
  // contracts Solicited
  Meteor.defer(() => {
  const totalOrgs = Orgs.find({}).count();
  const totalPersons= Persons.find({}).count();
  const org = Orgs.findOne(selector(id));
    const contractsSolicited = org.contractsSolicited();
    if (contractsSolicited.count() > 0) {
      // FIXME should this be ranked suppliers?
      const suppliersPersonRanked = rankedSuppliersPerson();
      const suppliersOrgRanked = rankedSuppliersOrg();
      // console.log(suppliersOrgRanked);
      // const dependenciesRanked = rankedDependencies();
      contractsSolicited.forEach((doc, i) => {
        if (i > LIMIT) return;
        let ranked;
        if (doc.hasOwnProperty('suppliers_person')) {
          ranked = find(suppliersPersonRanked, o => (doc.suppliers_person.indexOf(o._id) > -1));
          extend(ranked, {rank: (ranked.count/totalPersons)})
        } else {
          ranked = find(suppliersOrgRanked, o => (doc.suppliers_org.indexOf(o._id) > -1));
          extend(ranked, {rank: (ranked.count/totalOrgs)});
        }
        const publish = extend(doc, omit(ranked,'_id'));
        return publicator(self, publish, 'contracts', publishedKeys);
      });
    }
  })

  console.timeEnd('pub')// (start, end, (end-start));

  this.ready();
});

// FIXME implement when rindecuentas.org is tagged w/
// exact names of qqw
// Meteor.publish('storiesRelatedToOrganization', function(id) {
//   check(id, String);
//   this.ready();
// });


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
