import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Matches from './matches.js';
import { Orgs } from '../organizations/organizations.js';
import { Persons } from '../persons/persons.js';
import { matcher } from './lib.js';

export const negateMatch = new ValidatedMethod({
  name: 'Matches.methods.negate',

  validate: new SimpleSchema({
    origin: { type: String },
    match: { type: String },
    collection: {
      type: String,
      allowedValues: ['organizations', 'persons']
    }
  }).validator(),

  run({ origin, match, collection }) {
    this.unblock();
    let result = Matches.upsert(
      { simple: origin },
      {
        $setOnInsert: {
          simple: origin,
          collection: collection,
          match_count: 0
        },
        $addToSet: { antonyms: match },
        $inc: { match_count: 1 }
      }
    )
    if (Meteor.isServer){
      let m = matcher( origin );
      return m
    }
    else {
      return result
    }
  }
});

export const negateMatchBatch = new ValidatedMethod({
  name: 'Matches.methods.negateBatch',

  validate: new SimpleSchema({
    origin: { type: String },
    match: { type: Array },
    'match.$': String,
    collection: {
      type: String,
      allowedValues: ['organizations', 'persons']
    }
  }).validator(),

  run({ origin, match, collection }) {
    this.unblock();
    let result = Matches.upsert(
      { simple: origin },
      {
        $setOnInsert: {
          simple: origin,
          collection: collection,
          match_count: 0
        },
        $addToSet: { antonyms: { $each: match } },
        $inc: { match_count: match.length }
      }
    )
    if (Meteor.isServer){
      let m = matcher( origin );
      return m
    }
    else {
      return result
    }
  }
});

export const approveMatch = new ValidatedMethod({
  name: 'Matches.methods.approve',

  validate: new SimpleSchema({
    origin: { type: String },
    match: { type: String },
    collection: {
      type: String,
      allowedValues: ['organizations', 'persons']
    },
    type: {
      type: String,
      allowedValues: ['equivalence', 'parent', 'child' ],
    }
  }).validator(),

  run({ origin, match, collection, type }) {
    this.unblock();
    if (Meteor.isServer){
      let col = Orgs;

      if ( collection === 'persons') {
        col = Persons;
      }
      if ( type === 'equivalence' ) {
        //console.log(p)
      }
      if ( type === 'child' ) {
        let doc = col.findOne({ simple: match });
        let child = {
          name: doc.name,
        }
        col.update(
          { simple: origin },
          { $addToSet: { owns: child } }
        )
      }
      if ( type === 'parent' ) {
        let doc = col.findOne({ simple: match });
        let parent = {
          name: doc.name,
        }
        col.update(
          { simple: origin },
          { $addToSet: { owned_by: parent } }
        )
      }
    }

  }
});
