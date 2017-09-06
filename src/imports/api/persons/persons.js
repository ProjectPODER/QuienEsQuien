import { isEqual, omit, extend, keys, intersection } from 'lodash';
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';
import { Index, MongoDBEngine } from 'meteor/easy:search';
import { Memberships } from '../memberships/memberships';
import { Contracts } from '../contracts/contracts';
import { PersonSchema } from './schema';
import { insertRevision } from '../revisions/revisions';
import { logUserAction } from '../users/users';
import { statPersonUpdate, statPersonRemove } from '../stats/lib';

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

Persons.before.insert((userId, doc) => {
  doc.user_id = doc.user_id || userId;
  if (!doc.user_id) {
    throw new Error(doc);
  }
  extend(doc, { created_at: new Date() });
});

Persons.before.upsert((userId, selector, modifier) => {
  modifier.$set = modifier.$set || {};
  extend(modifier.$set, { modified_at: new Date() });
  //modifier.$set.modified_at = Date.now();
  //modifier.$set.user_id = userId;
});

Persons.before.update(function (userId, doc, fieldNames, modifier, options) {
  // if documents has not changed, do not update

  if (intersection(keys(modifier), ['$inc', '$addToSet'] === 0)) {
    const cleanDoc = omit(doc, ['revisionId', 'created_at']);
    const cleanMod = omit(modifier.$set, 'lastModified');

    if (isEqual(cleanDoc, cleanMod)) {
      return false;
    }
  }
});

Persons.after.update(function (userId, doc, fieldNames, modifier, options) {
  //doc.user_id = doc.user_id || userId;
  // save revision
  if (!isEqual(this.previous, doc)) {
    doc.user_id = doc.user_id || userId;
    let revId = insertRevision(doc.user_id, this.previous, doc, 'persons');
    doc._id = revId;
    logUserAction(extend(doc, { action: 'update', collection: 'persons' }));
    statPersonUpdate();
  }
});

Persons.after.insert(function (userId, doc) {
  doc.user_id = doc.user_id || userId;
  logUserAction(extend(doc, { action: 'insert', collection: 'persons' }));
  statPersonUpdate(doc._id);
});

Persons.after.remove(function (userId, doc) {
  doc.user_id = doc.user_id || userId;
  logUserAction(extend(doc, { action: 'insert', collection: 'persons' }));
  statPersonRemove(doc._id);
});

Persons.attachSchema(PersonSchema);

Persons.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
