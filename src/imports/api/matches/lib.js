import { Orgs } from '../organizations/organizations.js';
import { Persons } from '../persons/persons.js';
import { Matches } from './matches.js';
import { take, extend, words, mean, filter, find } from 'lodash';
import fuzzy from 'clj-fuzzy';

export function matcher( string ){
  let s = stem(string);
  const results = textSearch(s);
  x = filterMatches(string, results);
  return x
}

export function textSearch( string ) {
  return  Orgs.find(
    { $text: { $search: string } },
    {
      fields: { score: { '$meta': 'textScore' } },
      sort: { score: { $meta: "textScore" } },
      limit: 500
    },
  ).fetch();
}

export function filterMatches(string, results) {
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

export function stem(string){
  let array = [];
  // split
  words(string).forEach(function(word){ if ( word.length > 1 ) { array.push( word ) } })

  return array.join(' ')
    .replace(/(^|\s)(INC|LLC|LTD|CIA|LAB|GMBH?|GROUP|CORP|GAS|LAB|SEGUROS|FINAN(E|CIERA)|SYSTEM|INTERNATIONAL|INGENIERIA)\s?\.?,?/i,' ')
    .replace(/\s?s\s?a\s?b?\s?de?\s?c\s?v\s?/i, '')
    .trim()
    .toLowerCase()
}

function toper(origin, results) {
  return filter(results, function(o){
      let dice = fuzzy.metrics.dice(stem(origin), stem(o.simple));
      return ( parseFloat(dice) > 0.3 )
  });
}
