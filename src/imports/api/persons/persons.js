import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';
import { Index, MongoDBEngine } from 'meteor/easy:search';
import Memberships from '../memberships/memberships';
import { Contracts } from '../contracts/contracts';
import { Revisions } from '../revisions/revisions';
import PersonSchema from './schema';

export const Persons = new Mongo.Collection('persons');

export const PersonsIndex = new Index({
  collection: Persons,
  fields: ['simple'],
  engine: new MongoDBEngine(),
});

Persons.helpers({
  collectionName() {
    return 'persons';
  },
  editableBy(userId) {
    const isAdmin = Roles.userIsInRole(userId, 'admin');
    return isAdmin || this.user_id === userId;
  },
  revisions() {
    return Revisions.find({documentId: this._id});
  },
  shares() {
    return Memberships.find({
      role: 'shareholder',
      person_id: this.simple,
    }, {
      fields: {
        user_id: 0,
        person: 0,
        person_id: 0,
      },
      sort: {
        sob_org: 1,
      },
    });
  },
  board() {
    return Memberships.find({
      department: 'board',
      person_id: this.simple,
    }, {
      fields: {
        user_id: 0,
        person: 0,
        person_id: 0,
      },
      sort: {
        sob_org: 1,
      },
    });
  },
  posts() {
    return Memberships.find({
      source: /cargografias/,
      person_id: this.simple,
    });
  },
  allMemberships() {
    return Memberships.find({
      person_id: this.simple,
    });
  },
  suppliesContracts() {
    return Contracts.find({
      suppliers_person: this.simple,
    }, {
      fields: {
        user_id: 0,
      },
      sort: {
        amount: -1,
      },
    });
  },
});

Persons.attachSchema(PersonSchema);

Persons.deny({
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
