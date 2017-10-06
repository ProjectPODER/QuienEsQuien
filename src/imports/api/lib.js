import {
  extend,
  omit,
  flow,
  flatten,
  values,
  compact,
  isEmpty,
  isString,
  omitBy,
  isNil,
  isArray,
  isObject,
  isDate,
  mapValues,
} from 'lodash/fp';

export const compOmissions = [
    'revisionId',
    'created_at',
    'lastModified',
    'suppliesContracts',
    'contracts',
    'board',
    'shares',
    'collectionName',
    'editableBy',
    'revisions',
    'isPublic',
    'shareholders',
    'dependencyDocument',
    'departmentDocument',
    'suppliersOrg',
    'suppliersPerson',
    'names',
    'name',
    'simple',
    '_id',
];

export const imageUrlRegExp = /^((https?|ftp):)?\/\/.*(jpeg|jpg|png|gif|bmp)$/i;

export function squash(mod) {
  const addToSet = mapValues(mod.$addToSet, (v) => {
    return [v];
  });
  return Object.assign({}, mod.$set, addToSet);
}

const removeDiacritics = require('diacritics').remove;

export const omited = ['competitors', 'memberships', 'owns', 'owned_by'];

export function isEmptyObject(object) {
  return flow(
    values,
    flatten,
    compact,
    isEmpty,
  )(object);
}

export function omitEmpty(object) {
  return flow(
    omitBy(isNil),
    omitBy(v => (isString(v) && isEmpty(v))),
    omitBy(v => (isArray(v) && isEmpty(v))),
    omitBy(v => (!isDate(v) && isObject(v) && isEmpty(v))),
  )(object);
}

export function upsertFunction(collection, doc) {
  return collection.upsert(
    { 'simple': doc.simple },
    {
      $setOnInsert: {
        simple: doc.simple,
        name: doc.name,
//        names: [],
      },
      $addToSet: { names: doc.name },
      $set: omit(['simple', 'name', 'names'], doc),
    });
}

export function comma_split_and_reverse(name) {
  return name.split(',').reverse().join(' ').trim();
}

export function arrays_for_upsert(object) {
  var arrays = {};
  if (object.names && object.names.length > 0) {
    var names = { names: { $each: object.names } };
    extend(names)(arrays);
  }
  if (object.competitors && object.competitors.length > 0) {
    var competitors = { competitors: { $each: object.competitors } };
    extend(competitors)(arrays);
  }
  if (object.owned_by && object.owned_by.length > 0) {
    var parents = { owned_by: { $each: object.owned_by } };
    extend(parents)(arrays);
  }
  if (object.owns && object.owns.length > 0) {
    var suborgs = { owns: { $each: object.owns } };
    extend(suborgs)(arrays);
  }
  if (object.memberships && object.memberships.length > 0) {
    var members = { memberships: { $each: object.memberships } };
    extend(members)(arrays);
  }

  if (!isEmpty(arrays)) {
    return arrays;
  }
  return false;
}

export function upsertObject(doc) {
  const arrays = arrays_for_upsert(doc);
  const object = { $set: omit(doc, omited.concat(['names'])) };
  object.$setOnInsert = { names: doc.names };
  if (arrays) {
    object.$addToSet = arrays;
  }

  return object;
}

export function simpleName(string) {
  return removeDiacritics(string)
    .replace(/[,.]/g, '') // remove commas and periods
    .toLowerCase();
}
