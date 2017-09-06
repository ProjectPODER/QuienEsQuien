import {
updateMembers,
baseMod,
zipper,
inverseData,
dbOperators,
tmpPersons,
tmpOrgs,
} from '../index';
import { simpleName } from '../../../lib';

export function personData(data) {
  const name = [data.nombre.trim(), data.apellido.trim()].join(' ');
  return {
    source: 'cargografias',
    name,
    first_name: data.nombre,
    family_name: data.apellido,
    gender: data.sexo,
    party: data.partido,
    party_general: data.partidoGeneral,
  };
}

export function personScheme(data, userId) {
  // all these are symetric and
  // may be handeld in the same way
  const A_RELATIONS = ['organization', 'party'];
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
