/*
eslint no-param-reassign: ["error",
  { "props": true, "ignorePropertyModificationsFor": ["doc", "modifier"] }
]*/
import { isEqual, omit, extend, intersection, keys, has } from 'lodash';
import { Mongo } from 'meteor/mongo';
import { Index, MongoDBEngine } from 'meteor/easy:search';
import { Memberships } from '../memberships/memberships';
import { Contracts } from '../contracts/contracts';
import { OrganizationSchema } from './schema';
import { insertRevision } from '../revisions/revisions';
import { logUserAction } from '../users/users';
import { statOrgUpdate, statOrgRemove } from '../stats/lib';

export const Orgs = new Mongo.Collection('organizations');

export const OrgsIndex = new Index({
  collection: Orgs,
  fields: ['simple'],
  engine: new MongoDBEngine(),
});

Orgs.helpers({
  collectionName() {
    return 'organizations';
  },
  isPublic() {
    return (has(this, 'public') || this.category === 'public');
  },
  shareholders() {
    return Memberships.find({
      role: 'shareholder',
      sob_org: this.simple,
    }, {
      fields: {
        user_id: 0,
        sob_org: 0,
      },
      sort: {
        person_id: 1,
        org_id: 1,
      },
    });
  },
  shares() {
    return Memberships.find({
      role: 'shareholder',
      org_id: this.simple,
    }, {
      fields: {
        user_id: 0,
        org: 0,
        org_id: 0,
      },
      sort: {
        sob_org: 1,
      },
    });
  },
  board() {
    return Memberships.find({
      department: 'board',
      sob_org: this.simple,
    }, {
      fields: {
        user_id: 0,
        sob_org: 0,
      },
      sort: {
        person_id: 1,
      },
    });
  },
  suppliesContracts() {
    return Contracts.find({
      $or: [
        { suppliers: this.simple },
        { suppliers_org: this.simple },
        { proveedor: this.simple },
      ],
    }, {
      fields: {
        user_id: 0,
      },
      sort: {
        amount: -1,
      },
    });
  },
  contracts() { // solicits contracts (contracts organization x...)
    return Contracts.find({
      $or: [ // should we use simple?
        {
          dependency: {
            $in: this.names,
          },
        },
        {
          department: {
            $in: this.names,
          },
        },
      ],
    }, {
      fields: {
        user_id: 0,
      },
      sort: {
        created_at: -1,
      },
    });
  },
});

Orgs.before.insert((userId, doc) => {
  doc.user_id = doc.user_id || userId;
  if (!doc.user_id) {
    throw new Error(doc);
  }
  extend(doc, { created_at: new Date() });
});

Orgs.before.upsert((userId, selector, modifier) => {
  modifier.$set = modifier.$set || {};
  modifier.$set.user_id = modifier.$set.user_id ||
    userId; extend(modifier.$set, { modified_at: new Date() });
  // modifier.$set.modified_at = Date.now();
  // modifier.$set.user_id = userId;
});

Orgs.before.update((userId, doc, fieldNames, modifier) => {
  // if documents has not changed, do not update
  if (intersection(keys(modifier), ['$inc', '$addToSet'] === 0)) {
    const cleanDoc = omit(doc, ['revisionId', 'created_at']);
    const cleanMod = omit(modifier.$set, 'lastModified');

    if (isEqual(cleanDoc, cleanMod)) {
      return false;
    }
  }
  return true;
});

Orgs.after.update((userId, doc) => {
  if (!isEqual(this.previous, doc)) {
    doc.user_id = doc.user_id || userId;
    const revId = insertRevision(doc.user_id, this.previous, doc, 'organizations');
    doc._id = revId;
    logUserAction(extend(doc,
      { action: 'update', collection: 'organizations' },
    ));

    statOrgUpdate();
  }
});

Orgs.after.insert((userId, doc) => {
  doc.user_id = doc.user_id || userId;
  logUserAction(extend(doc, { action: 'insert', collection: 'organizations' }));
  statOrgUpdate(doc._id);
});

Orgs.after.remove((userId, doc) => {
  doc.user_id = doc.user_id || userId;
  logUserAction(extend(doc, { action: 'insert', collection: 'organizations' }));

  statOrgRemove(doc._id);
});

Orgs.attachSchema(OrganizationSchema);

Orgs.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});
