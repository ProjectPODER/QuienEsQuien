import {
  has,
  filter,
  omit
} from 'lodash';
import { Logger } from 'meteor/ostrio:logger';
import Tmp from './tmp.js';
import {
  Persons
} from '../persons/persons.js';
import {
  Orgs
} from '../organizations/organizations.js';
import {
  upsertFunction,
  arrays_for_upsert,
  omited,
  simpleName,
  comma_split_and_reverse,
} from '../lib.js';

const log = new Logger();

export const flushTmp = function(userId, callback){
  // flushed everything it can from Tmp collection
  // passes number of remain documents to callback

  var collection = Tmp.rawCollection(); // use raw mongodb col to avoid reactivity

  collection.find({}).toArray(Meteor.bindEnvironment(function(err, docs) {
    let docsFlushed = 0;
    let unknowns = filter(docs, function(doc) {
      return (!has(doc, 'data_type'));
    });

    log.info(`${docs.length} temporary records`);
    log.info(`${unknowns.length} unknowns`);
    docs.forEach(function(object) {

      // first get everything wich is not yet identied as person or org
      // and try to match it against those already identifed
      // then update everything to Orgs and Persons collections
      Meteor.sleep(100);
      object.user_id = userId;
      var doc = omit(object, ['_id']);
      if (object.data_type === 'org' ){

        orgFromTmp( { document: doc, id: object._id } );

      } else if (object.data_type === 'person') {

        personFromTmp( { document: doc, id: object._id } );

      } else {
      // try to update the rest to one collection or the other.
      // what does not already exist in Persons or Orgs collections stasys in Tmp

        let arrays = arrays_for_upsert(doc);
        let result1 = Orgs.update(
          { name: doc.name },
          {
            $set: omit(doc, omited),
            $addToSet: arrays
        });

        if (result1 > 0){
          Tmp.remove({ _id: object._id }, function(err){
            if (err) return log.error(err.message, err)

            // FIXME return dec_tmp_stats( object._id )
            return
          });
        }

        let result2 = Persons.update(
          { name: comma_split_and_reverse(doc.name) },
          {
            $set: Object.assign({}, omit(doc, omited), {name: comma_split_and_reverse(doc.name)}),
            $addToSet: arrays
        });

        if (result2 > 0){
          Tmp.remove({ _id: object._id }, function(err){
            if (err) return log.error(err.message, err)

            // FIXME return dec_tmp_stats( object._id )
            return
          });
        }

      }

      docsFlushed++;

      if(docsFlushed === docs.length) {
        log.info('Temporary docs Flushed');
        let remaining_temporary_documents = Tmp.find().count();
        return callback && callback( remaining_temporary_documents );
      }

    })

  }));
}

export const orgFromTmp = function(args) {
  let object = args.document;
  object.simple = simpleName(object.name);
  let id = args.id;

  let results = upsertFunction(Orgs, object);

  // FIXME update_org_stats( results.insertedId );
  Tmp.remove({ _id: id }, function(err){
    if (err) return log.err(err.message, err)

    // FIXME return dec_tmp_stats( id )
    return
  });
  return results;
}

export const personFromTmp = function(args) {
  let object = args.document;
  object.simple = simpleName(object.name);
  let id = args.id;

  let results = upsertFunction(Persons, object);

  // FIXME update_org_stats( results.insertedId );
  Tmp.remove({ _id: id }, function(err){
    if (err) return log.error(err.message, err)

    // FIXME return dec_tmp_stats( id )
    return
  });
  return results;
}
