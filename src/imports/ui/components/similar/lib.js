import { flatten, drop, mapValues, extend } from 'lodash';
import { orgUpdate, orgRemove } from '../../../api/organizations/methods.js';

const toMongodb = require('jsonpatch-to-mongodb');

export function addRelationship(data, originId, relationship) {
  let set = {};
  set[relationship] = { $each: flatten([ data ]) }

  let mod = { $addToSet : set };

  orgUpdate.call({ _id: originId, modifier: mod }, (error) => {
    if (error) throw error;

  });
}

export function applyPatch( patch, arrays, originId, simple ) {

  let pmod = toMongodb(patch);
  let fields = mapValues(arrays, (value, key) => {
    let set = {};
    return set[key] = { $each: value };
  })

  let push = { $addToSet : fields };
  let mod = extend({}, pmod, push );

  orgUpdate.call({ _id: originId, modifier: mod }, (error) => {
    if (error) throw error;

    orgRemove.call({ simple: simple }, (error) => {
      if (error) throw error;
    });
  });

}

export function addHunk(hunk, originId) {
  let path = hunk.path.split('/');
  let path_base = path[1];
  let mod;

  if ( path_base === 'contract_count' ){
    mod = { $inc: { contract_count: hunk.value }};
  }
  else {
    mod = { $set : { path_base : hunk.value }}
  }

  orgUpdate.call({ _id: originId, modifier: mod }, (error) => {
    if (error) throw error;

  });

  //orgUpdate.call({ simple: simple, modifier: mod2 }, (error, result) => {
  //  if (error) throw error;

  //})
}

export function replaceHunk(hunk, originId) {
  let path = drop(hunk.path.split('/'));
  let mod;
  let set = {};
  set[path.join('.')] = hunk.value;
  mod = { $set: set }
  orgUpdate.call({ _id: originId, modifier: mod }, (error) => {
    if (error) throw error;

  });
}
