import {
  extend,
  camelCase,
  mapKeys,
} from 'lodash';
import {
  simpleName,
  omitEmpty,
  imageUrlRegExp,
} from '../../../lib';
import {
  joinNames,
  isInitials,
  stripProtocol,
} from '../lib';
import {
  updateMembers,
  baseMod,
  tmpOrgs,
  tmpPersons,
} from '../index';

const DATA_SOURCE = 'cargografias:argentina';

export function getGender(string) {
  if (/hombre/i.test(string)) {
    return 'Male';
  }
  if (/mujer/i.test(string)) {
    return 'Female';
  }
  return null;
}

export function personData(data) {
  const name = joinNames(data).trim();
  const gender = getGender(data.sexo);
  const object = {
    name,
    first_name: data.nombre,
    family_name: data.apellido,
    gender,
  };

  if (data.urlFoto && imageUrlRegExp.test(data.urlFoto)) {
    extend(object, { imageUrl: data.urlFoto })
  }
  return omitEmpty(object);
}

export function referenceData(data) {
  // references for membership object
  const array = [];
  const REFERENCES = ['Fin', 'Inicio'];
  for (let i = 0; i < REFERENCES.length; i += 1) {
    const ref = REFERENCES[i];

    // we may have multiple urls embedded in a string
    const URLS = data[`urlFuente${ref}`].split(',').map(s => (s.trim()));
    for (let ii = 0; ii < URLS.length; ii += 1) {
      const url = stripProtocol(URLS[ii]);
      const obj = {
        url,
        quality: data[`calidadDelDato${ref}`]
          .replace(/\[chequeado\]/, '').trim(),
        chequeado: /\[chequeado\]/.test(data[`calidadDelDato${ref}`]),
      };

      if (ref === 'Inicio') {
        extend(obj, { field: 'start_date' });
      }
      if (ref === 'Fin') {
        extend(obj, { field: 'end_date' });
      }
      if (obj.url || obj.quality) {
        array.push(omitEmpty(obj));
      }
    }
  }
  return array;
}

export function orgMods(data) {
  const OUT = [];
  let PGIsInitials = true;

  const ORGS = [
    data.organizacion,
    data.partido,
  ];

  if (data.partido && data.partidoGeneral) {
    PGIsInitials = isInitials(data.partido, data.partidoGeneral);
  }
  if (!PGIsInitials) {
    ORGS.push(data.partidoGeneral);
  }

  for (let i = 0; i < ORGS.length; i += 1) {
    if (ORGS[i]) {
      const org = ORGS[i].trim();
      const mod = baseMod(org);

      if (i === 0) {
        if (data.parentOrg) {
          extend(mod.$addToSet, { parent: data.parentOrg });
        }
        if (data.cargoTipo && data.cargoTipo.toLowerCase().trim() === 'privado') {
          extend(mod.$setOnInsert, { category: 'company' });
        } else {
          extend(mod.$setOnInsert, { category: 'public' });
        }
      }

      if (i === 1 && PGIsInitials) {
        extend(mod, { $set: { initials: data.partidoGeneral } });
      }

      if (i > 0) {
        extend(mod.$setOnInsert, { category: 'party' });
      }
      OUT.push(mod);
    }
  }
  return OUT;
}

function orgRutine(data) {
  const array = orgMods(data);
  for (let i = 0; i < array.length; i += 1) {
    const mod = array[i];
    const simple = mod.$setOnInsert.simple;
    extend(mod.$setOnInsert, { source: DATA_SOURCE });
    tmpOrgs.upsert({
      simple,
    }, mod);
  }
}

function partySubParty(data) {
  return {
    org: data.partidoGeneral,
    org_id: data.partidoGeneral,
    sob_org: data.partido,
  };
}

function partyMembershipData(data) {
  const name = joinNames(data);
  return {
    person: name,
    role: 'member',
    person_id: simpleName(name),
    sob_org: simpleName(data.partido),
  };
}

export function orgMembershipData(data) {
  const name = joinNames(data);
  const obj = {
    person: name,
    person_id: simpleName(name),
    sob_org: simpleName(data.organizacion),
    role: data.cargoNominal,
    territory: data.territorio,
    territory_extended: data.territorioExtendido,
    post_type: data.cargoTipo,
    post_class: data.cargoClase,
  };
  const extendedAttributes = {
    references: referenceData(data),
  }
  if (data.fechaInicio) {
    extend(extendedAttributes, { start_date: new Date(data.fechaInicio) });
  }
  if (data.fechaFin) {
    extend(extendedAttributes, { end_date: new Date(data.fechaFin) });
  }
  return extend(omitEmpty(obj), extendedAttributes);
}

function memberShipRutine(data) {
  // insert memberships here

  const memberships = [
    orgMembershipData(data),
    partyMembershipData(data),
    partySubParty(data),
  ];

  for (let i = 0; i < memberships.length; i += 1) {
    const membership = memberships[i];
    if (membership.org_id || membership.person_id) {
      membership.source = DATA_SOURCE;
      updateMembers(membership);
    }
  }
}

export function cargografiasImportRow(data) {
  const camelized = mapKeys(data, (value, key) => (camelCase(key)));
  // memberships: org and parties
  // person: name, apellido
  // orgs: organizacion, party, partidoGeneral
  orgRutine(camelized);
  memberShipRutine(camelized);

  const person = personData(camelized);
  const setter = {
    $setOnInsert: {
      source: DATA_SOURCE,
    },
    $set: person,
    $addToSet: { names: person.name },
  };
  return tmpPersons.upsert({
    simple: simpleName(person.name),
  }, setter);
}
