import { has } from 'lodash';
import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';
import { Index, MongoDBEngine } from 'meteor/easy:search';
import Memberships from '../memberships/memberships';
import { Contracts } from '../contracts/contracts';
import { Revisions } from '../revisions/revisions';
import OrganizationSchema from './schema';

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
  editableBy(userId) {
    const isAdmin = Roles.userIsInRole(userId, 'admin');
    return isAdmin || this.user_id === userId;
  },
  isPublic() {
    return (has(this, 'public') || this.category === 'public');
  },
  editableby(userId) {
    return this.user_id === userId;
  },
  revisions() {
    return Revisions.find({documentId: this._id})
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
  allMemberships() {
    return Memberships.find({
      person_id: this.simple,
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
