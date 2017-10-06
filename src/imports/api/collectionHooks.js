import { isEqual, omit, extend, keys } from 'lodash';
import { CollectionHooks } from 'meteor/matb33:collection-hooks';
import { Persons } from './persons/persons.js';
import { Orgs } from './organizations/organizations.js';
import { Contracts } from './contracts/contracts.js';
import Memberships from './memberships/memberships.js';
import { compOmissions, squash } from './lib';
import { insertRevision } from './revisions/revisions';
import { logUserAction } from './users/users';
// import { statPersonUpdate, statPersonRemove } from './stats/lib';

[
  Orgs,
  Persons,
  Contracts,
  Memberships,
].forEach(collection => {
  collection.before.insert((userId, doc) => {
    const user = doc.user_id
      || userId
      || CollectionHooks.defaultUserId;

    if (!user) {
      throw new Error(doc);
    }
    extend(doc, {
      created_at: new Date(),
      user_id: user,
    });
  });

  collection.before.upsert((userId, selector, modifier) => {
    const user = userId
      || CollectionHooks.defaultUserId;

    modifier.$set = modifier.$set || {};

    // if documents has not changed, do not update
    // $inc represets a garanteed changed
    // add to set may change the document if the new values is not
    // already present: so we squash $set and $addToSet together to
    // create a compasrable document
    if (keys(modifier).indexOf('$inc') < 0) {
      const doc = collection.findOne(selector);
      const squashed = squash(modifier);
      const cleanDoc = omit(doc, compOmissions);
      const cleanMod = omit(squashed, compOmissions);
      if (isEqual(cleanDoc, cleanMod)) {
        return false;
      }
    }

    extend(modifier.$set, {
      lastModified: new Date(),
      user_id: user,
    });

  });

  collection.before.update(function (userId, doc, fieldNames, modifier) {
    const user = userId
      || CollectionHooks.defaultUserId;

    modifier.$set = modifier.$set || {};

    // if documents has not changed, do not update
    if (keys(modifier).indexOf('$inc') < 0) {
      const squashed = squash(modifier);
      const cleanDoc = omit(doc, compOmissions);
      const cleanMod = omit(squashed, compOmissions);
      if (isEqual(cleanDoc, cleanMod)) {
        return false;
      }
    }

    extend(modifier.$set, {
      lastModified: new Date(),
      user_id: user,
    });
  });

  collection.after.update(function (userId, doc) {
    const user = doc.user_id
      || userId
      || CollectionHooks.defaultUserId;

    // save revision

    // FIXME guard for `this.previous` is a workaround for
    // matb33:meteor-collection-hooks/issues/103
    // It may result in loosing some revisions
    // so it should be removed when that issue is resolved
    if (this.previous && !isEqual(this.previous, doc)) {
      const revId = insertRevision(user, this.previous, doc, collection._name);
      doc._id = revId;
      logUserAction(extend(doc, {
        action: 'update',
        collection: collection._name,
        user_id: user,
      }));
      // statPersonUpdate();
    }
  });

  collection.after.insert(function (userId, doc) {
    const user = doc.user_id
      || userId
      || CollectionHooks.defaultUserId;

    logUserAction(extend(doc, {
      action: 'insert',
      collection: collection._name,
      user_id: user,
    }));
    // statPersonUpdate(doc._id);
  });

  collection.after.remove(function (userId, doc) {
    const user = doc.user_id
      || userId
      || CollectionHooks.defaultUserId;

    doc.user_id = doc.user_id || userId;
    logUserAction(extend(doc, {
      action: 'insert',
      collection: collection._name,
      user_id: user,
    }));
    // statPersonRemove(doc._id);
  });
})
