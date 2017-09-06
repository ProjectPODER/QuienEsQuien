import { Random } from 'meteor/random';
import {
} from 'lodash';
import {
  baseMod,
  zipper,
  dbOperators,
  updateMembers,
  tmpPersons,
  tmpOrgs,
} from '../index';
import {
  simpleName,
  omitEmpty,
} from '../../../lib';
import {
  getCountry,
} from '../lib';

export function personData(data) {
  const country = getCountry(data.country[0]);
  const obj = {
    names: [data.name],
    name: data.name,
    simple: simpleName(data.name),
    gender: data.gender,
  };
  if (country) {
    obj.address = {
      country: country.cca2,
    };
  }
  return omitEmpty(obj);
}

export function inverseData(set, string) {
  return {
    sob_org: simpleName(set.org),
    person: string,
    person_id: simpleName(string),
    role: set.role,
    department: set.department,
    start_date: set.start_date,
    end_date: set.end_date,
  };
}

export function gacmPersonScheme(data, userId) {
  // all these are symetric and
  // may be handeld in the same way
  const A_RELATIONS = ['board', 'public', 'professional'];
  for (let ii = 0; ii < A_RELATIONS.length; ii += 1) {
    const string = A_RELATIONS[ii];
    if (data[string]) {
      for (let i = 0; i < data[string].length; i += 1) {
        const o = zipper(i, data, string);
        o.org = data[string][i];
        const mod = baseMod(o.org, userId);
        if (string === 'public') {
          mod.$set = { category: 'public' };
        }
        if (string === 'professional') {
          mod.$set = { category: 'company' };
        }
        tmpOrgs.upsert({ simple: simpleName(o.org) }, mod);
        const member = inverseData(o, data.name);
        member.user_id = userId;
        updateMembers(member);
      }
    }
  }

  const parsed = personData(data);
  const setter = dbOperators(parsed, userId);
  tmpPersons.upsert({
    simple: parsed.simple,
  }, setter);
}
