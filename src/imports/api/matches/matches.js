import SimpleSchema from 'simpl-schema';

const Matches = new Mongo.Collection("matches");

const EquivalenceSchemaObject = {
  canon: {
    type: String,
    max: 200,
    optional: true
  },
  simple: {
    type: String,
    max: 200,
  },
  synonyms: {
    type: Array,
    optional: true
  },
  'synonyms.$': String,
  antonyms: {
    type: Array,
    optional: true
  },
  'antonyms.$': String,
  collection: {
    type: String,
    max: 20
  },
  match_count: {
    type: Number
  }
};

/**
@type {Object}
@property {string} canon chosen canonical best choice
@property {string} simplfied version of canon
@property {string} string variations which refer to the same entity
@property {string} string variations which do not refer to the same entity
@property {string} collection where this entity is stored (Person or Organization)
*/

const EquivalenceSchema = new SimpleSchema(EquivalenceSchemaObject);

Matches.attachSchema(EquivalenceSchema);

Matches.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

export default Matches;
