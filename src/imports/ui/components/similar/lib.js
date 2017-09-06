import { DATA_ARRAYS } from './similar.js';
import { flatten, drop, last, mapValues, extend } from 'lodash';
import { orgUpdate, orgRemove } from '../../../api/organizations/methods.js';
const toMongodb = require('jsonpatch-to-mongodb');

export function addRelationship(data, originId, relationship) {
  let set = {};
  set[relationship] = { $each: flatten([ data ]) }

  let mod = { $addToSet : set };

  orgUpdate.call({ _id: originId, modifier: mod }, (error, result) => {
    if (error) throw error;

  });
}

export function applyPatch( patch, arrays, originId, simple ) {

  let pmod = toMongodb(patch);
  let fields = mapValues(arrays, (value, key, object) => {
    let set = {};
    return set[key] = { $each: value };
  })

  let push = { $addToSet : fields };
  let mod = extend({}, pmod, push );

  orgUpdate.call({ _id: originId, modifier: mod }, (error, result) => {
    if (error) throw error;

    orgRemove.call({ simple: simple }, (error, result) => {
      if (error) throw error;
    });
  });

}

export function addHunk(hunk, originId, simple ) {
  let path = hunk.path.split('/');
  let path_base = path[1];
  let path_last = last(path);
  let mod, mod2;

  if ( path_base === 'contract_count' ){
    mod = { $inc: { contract_count: hunk.value }};
    mod2 = { $unset: { contract_count }};
  }
  else {
    mod = { $set : { path_base : hunk.value }}
  }

  orgUpdate.call({ _id: originId, modifier: mod }, (error, result) => {
    if (error) throw error;

  });

  //orgUpdate.call({ simple: simple, modifier: mod2 }, (error, result) => {
  //  if (error) throw error;

  //})
}

export function replaceHunk(hunk, originId, simple) {
  let path = drop(hunk.path.split('/'));
  let mod, mod2;
  let set = {};
  set[path.join('.')] = hunk.value;
  mod = { $set: set }
  orgUpdate.call({ _id: originId, modifier: mod }, (error, result) => {
    if (error) throw error;

  });
}
