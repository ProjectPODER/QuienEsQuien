import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { compare } from 'fast-json-patch';

export const Revisions = new Mongo.Collection("revisions");

export function insertRevision(userId, left, right, collection ){

  const date = new Date();
  let patch = {
    documentId: right._id,
    collection: collection,
    date: date,
    user_id: userId,
    patch: compare(left, right),
    reverse: compare(right, left)
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

RevisionSchema = new SimpleSchema({
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
