import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { OrganizationSchema } from './schema.js';
import { Orgs } from './organizations.js';
import { Matches } from '../matches/matches.js';
import SimpleSchema from 'simpl-schema';
import { take, extend, words, mean, filter, find } from 'lodash';
import { simpleName } from '../lib.js';
const fuzzy = require('clj-fuzzy');

export const orgInsert = new ValidatedMethod({
  name: 'Orgs.methods.insert',
  validate(document){
     OrganizationSchema.clean(document);
     OrganizationSchema.validator(document);
  },
  run(document) {
    return Orgs.insert(document);
  }
});

export const orgUpdate = new ValidatedMethod({
  name: 'Orgs.methods.update',
  validate(args){
     OrganizationSchema.validator(args.modifier, { modifier: true });
  },
  run({ _id, modifier }) {
    return Orgs.update({
      _id: _id
    }, modifier );
  }
});

export const orgRemove = new ValidatedMethod({
  name: 'Orgs.methods.remove',
  validate: new SimpleSchema({
    simple: { type: String }
  }).validator(),
  run({ simple }) {
    return Orgs.remove({
      simple: simple
    });
  }
});

export const similarOrgs = new ValidatedMethod({
  name: 'Orgs.methods.match',

  validate: new SimpleSchema({
    simple: { type: String }
  }).validator(),

  run({ simple }) {
    this.unblock();
    return match( simple );
  }
});

export const getOrg = new ValidatedMethod({
  name: 'Orgs.methods.get',

  validate: new SimpleSchema({
    simple: {
      type: String,
      max: 200,
    },
  }).validator(),

  run({ simple }) {
    this.unblock();
    return Orgs.findOne({ simple });
  },
});

export const getOrgByIndex = new ValidatedMethod({
  name: 'Orgs.methods.getByIndex',

  validate: new SimpleSchema({
    index: { type: Number },
  }).validator(),

  run({ index }) {
    this.unblock();
    if ( Meteor.isServer ) {
      return match2( index );
    }
    return { document: {}, index: index };
  }
});

function match2( n ){
  let first = Orgs.find({},{limit:1, skip: n, sort:{simple: 1}}).fetch();
  let string = first[0].simple;
  let s = stem(string);
  const results = textSearch(s);
  let matches = filterMatches(string, results);
  return { document: first[0], index: n, matches: matches }
}

function match( string ){
    let x;
    if (Meteor.isClient) {
      x = Orgs.find(
        { simple: new RegExp( stem( string ), 'i') },
      );
    }

    if (Meteor.isServer) {
      let s = stem(string);
      const results = textSearch(s);
      x = filterMatches(string, results);
    }
    return x
}

function textSearch( string ) {
  return  Orgs.find(
    { $text: { $search: string } },
    {
      fields: { score: { '$meta': 'textScore' } },
      sort: { score: { $meta: "textScore" } },
      limit: 500
    },
  ).fetch();
}

function filterMatches(string, results) {
  let top = toper(string, results);

  if ( top.length > 0 ) {
    top = top
    .filter((x)=>{
      // remove the origin for which we are looking for similarities
      return (x.simple !== string)
    })
    .map(( result )=>{
      // get the metrics
      let doc = metrics( string, result );
      return doc;
    })
    .filter((x)=>{
      // filter again very unlikely matches
      return (x.levenshtein < 50 && x.dice > 0.3 && x.mean > 0)
    })
    .filter((x)=>{
      // filter out previously matched documents
      return ( Matches.find( {
        simple: string,
        $or: [ { antonyms: x.simple }, { synonyms: x.simple } ]
      }).fetch().length < 1 )
    })
  }
  return top;
}

function owns(doc, string) {
  return find(doc.owns, (child)=>{
    let simple = simpleName(child.name);

    return ( simple === string )
  })
}
function owned_by(doc, string) {
  return find(doc.owned_by, (child)=>{
    let simple = simpleName(child.name);

    return ( simple === string )
  })
}
function toper(origin, results) {
  return filter(results, function(o){
      let dice = fuzzy.metrics.dice(stem(origin), stem(o.simple));
      return ( parseFloat(dice) > 0.3 )
  });
}

function metrics(origin, result){
  let o = {
    _id: result._id,
    score: parseFloat(result.score).toFixed(2)/1,
    levenshtein: fuzzy.metrics.levenshtein(origin, result.simple),
    dice: parseFloat(fuzzy.metrics.dice(origin, result.simple)).toFixed(2)/1,
    tversky: parseFloat(fuzzy.metrics.tversky(origin, result.simple)).toFixed(2)/1,
    simple: result.simple,
  }
  return extend({}, {
    mean: parseFloat(mean([(20-o.levenshtein)/20, o.tversky, o.dice])).toFixed(2)/1,
  }, o );
}

function stem(string){
  let array = [];
  // split
  words(string).forEach(function(word){ if ( word.length > 1 ) { array.push( word ) } })

  return array.join(' ')
    .replace(/(^|\s)(INC|LLC|LTD|CIA|LAB|GMBH?|GROUP|CORP|GAS|LAB|SEGUROS|FINAN(E|CIERA)|SYSTEM|INTERNATIONAL|INGENIERIA)\s?\.?,?/i,' ')
    .replace(/\s?s\s?a\s?b?\s?de?\s?c\s?v\s?/i, '')
    .trim()
    .toLowerCase()
}
