import { mapValues } from 'lodash';
import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { compare } from 'fast-json-patch';

export const Revisions = new Mongo.Collection("revisions");

export function insertRevision(userId, left, right, collection ){
  const date = new Date();
  const arr = [left, right].map(obj => {
    // workaround https://github.com/Starcounter-Jack/JSON-Patch/issues/183
     return mapValues(obj, (v, k) => {
      if (['lastModified', 'created_at'].indexOf(k) > -1 || /date/.test(k)) {
        return v.toString();
      }
      return v;
    });
  });
  const patch = {
    documentId: right._id,
    collection: collection,
    date: date,
    user_id: userId,
    patch: compare(arr[0], arr[1]),
    reverse: compare(arr[1], arr[0])
  }

  return  Revisions.insert( patch )
}

const patchDefinition = {
  created_at: {
    type: Date
  },
  patch: {
    type: Array,
    blackbox: true
  },
  'patch.$': {
    type: Object,
    blackbox: true,
  },
  //op: {
  //  type: String,
  //  max: 200,
  //  allowedValues: ['add', 'remove', 'replace', 'move', 'copy', 'test']
  //},
  //path: {
  //  type: String,
  //  max: 200,
  //}
}

const RevisionSchema = new SimpleSchema({
  documentId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  created_at: {
    type: Date
  },
  updated_at: {
    type: Date,
  },
  collection: {
    type: String,
    allowedValues: ['organizations', 'persons', 'contracts'],
  },
  patches: {
    type: Array,
  },
  'patches.$': new SimpleSchema(patchDefinition),

});

/**
@type {Object}
@property {string} canon chosen canonical best choice
@property {string} simplfied version of canon
@property {string} string variations which refer to the same entity
@property {string} string variations which do not refer to the same entity
@property {string} collection where this entity is stored (Person or Organization)
*/

//Revisions.attachSchema(RevisionSchema);

Revisions.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
