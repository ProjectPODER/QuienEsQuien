import { Random } from 'meteor/random';
import {
  omit,
  flatten,
  uniq,
  compact,
} from 'lodash';
import {
  baseMod,
  tmpOrgs,
  tmpPersons,
  referenceData,
  zipper,
  dbOperators,
  updateMembers,
} from '../index';
import {
  AddressSchema,
} from '../../../addresses/addresses';
import {
  simpleName,
  omitEmpty,
} from '../../../lib';
import {
  getCountry,
  genOCDID,
} from '../lib';

export function addressData(data) {
  let country;
  if (data.country) {
    country = getCountry(data.country).cca2;
  }
  const obj = {
    state: data.state, // cdmx
    country,
    city: data.city,
    zone: data.zone,
    street: data.street,
    postal_code: data.zipcode,
    phones: flatten([data.phones]),
    website: data.website.replace(/.*?:\/\//g, ''),
    emails: flatten([data.emails]),
  };

  obj.ocd_id = genOCDID(obj);

  return AddressSchema.clean(omitEmpty(obj));
}

export function orgData(data) {
  const obj = {
    source: 'GACM',
    names: flatten([data.name, data.other_names]),
    name: data.name,
    simple: simpleName(data.name),
    initials: data.initials,
    foundation_date: data.foundation_year,
    address: addressData(data),
    references: referenceData(data),
  };

  if (data.suborgs) {
    obj.suborgs = data.suborgs.map(s => (simpleName(s)));
  }
  if (data.parent) {
    obj.parent = data.parent.map(s => (simpleName(s)));
  }
  if (data.parent_immediate) {
    obj.immediate_parent = simpleName(data.parent_immediate);
  }
  if (parseInt(data.public, 10) === 1) {
    obj.category = 'public';
  } else {
    obj.category = 'company';
  }

  if (data.employees) {
    obj.company = {
      employees: data.employees,
    };
  }
  return omitEmpty(obj);
}

export function parentData(data, userId) {
  // Insert parents as orgs.
  // Add to suborg array of parent
  const PARENTS = uniq(compact(flatten([data.parent, data.parent_immediate])
  .filter(s => (s))));
  for (let i = 0; i < PARENTS.length; i += 1) {
    const parent = PARENTS[i];
    const mod = baseMod(parent, userId);
    const simple = simpleName(data.name);
    if (simpleName(parent) !== simple) {
      // if x is parent of y
      // then y is suborg of x
      mod.$addToSet.suborgs = simple;
      tmpOrgs.upsert({ simple: simpleName(parent) }, mod);
    }
  }
}

export function inverseData(set, string) {
  const obj = {
    sob_org: simpleName(string),
    role: set.role,
    department: set.department,
    start_date: set.start_date,
    end_date: set.end_date,
  };
  if (set.org) {
    obj.org = set.org;
    obj.org_id = simpleName(set.org);
  }
  if (set.person) {
    obj.person = set.person;
    obj.person_id = simpleName(set.person);
  }
  return obj;
}

export function gacmOrgScheme(data, userId) {
  // Add parents as orgs
  // add to suborg array of parent
  parentData(data, userId);
  // relationships between two orgs
  const ORG_RELS = ['shareholders', 'lenders'];
  // all relationships
  const A_RELATIONS = ['board', 'shareholders_persons', 'shareholders', 'professionals', 'lenders'];

  for (let ii = 0; ii < A_RELATIONS.length; ii += 1) {
    const string = A_RELATIONS[ii];
    if (data[string]) { // string === relationship category
      for (let i = 0; i < data[string].length; i += 1) {
        const related = data[string][i];
        // related is an item in one of the above arrays
        const o = zipper(i, data, string);
        const mod = baseMod(related, userId);
        // check for field where relation is org -> org
        if (ORG_RELS.indexOf(string) > -1) {
          o.org = related;
          tmpOrgs.upsert({ simple: simpleName(related) }, mod);
        } else {
          o.person = related;
          tmpPersons.upsert({ simple: simpleName(related) }, mod);
        }
        const member = inverseData(o, data.name);
        member.user_id = userId;
        updateMembers(member);
      }
    }
  }

  // Update organization
  const parsed = orgData(data);
  const setter = dbOperators(parsed, userId);
  tmpOrgs.upsert({
    simple: parsed.simple,
  }, setter);
}
