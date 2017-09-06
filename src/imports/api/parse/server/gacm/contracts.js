import {
  capitalize,
  omit,
  extend,
  compact,
  isEmpty,
} from 'lodash';
import {
  referenceData,
  tmpContracts,
  baseMod,
  tmpOrgs,
  tmpPersons,
} from '../index';
import {
  simpleName,
} from '../../../lib';

export function contractData(data) {
  const ocid = `ocds-0ud2q6-${data.num_proc}`;

  return {
    title: capitalize(data.title),
    suppliers_org: [data.provider_org],
    suppliers_person: [data.provider_person],
    ocid: ocid.toUpperCase(),
    procedure_type: data.type_proc,
    type: data.type,
    amount: data.amount,
    currency: 'MXN',
    dependency: data.dependency,
    references: referenceData(data),
  };
}

function inverseContracts(data, userId) {
  // first add dependency to Orgs
  const dependency = data.dependency;
  const dMod = baseMod(dependency, userId);
  if (dMod.$set) {
    dMod.$set.cagetory = 'public';
  } else {
    dMod.$set = { category: 'public' };
  }
  dMod.$inc = { contract_count: 1 };
  tmpOrgs.upsert({ simple: simpleName(dependency) }, dMod);

  // add suppliers to correcto collection
  ['person', 'org'].forEach((string) => {
    const supplier = data[`suppliers_${string}`][0];
    const mod = baseMod(supplier, userId);
    mod.$inc = { contract_count: 1 };
    if (supplier && string === 'person') {
      tmpPersons.upsert({ simple: supplier }, mod);
    }
    if (supplier && string === 'org') {
      tmpOrgs.upsert({ simple: supplier }, mod);
    }
  });
}

export function gacmContractScheme(data, userId) {
  const parsed = contractData(data);
  inverseContracts(parsed, userId);

  const mod = {
    $setOnInsert: { ocid: parsed.ocid },
    $set: omit(parsed, [
      'ocid',
      'suppliers_org',
      'suppliers_person',
      'references',
    ]),
  };

  const addToSet = {};
  if (compact(parsed.suppliers_org).length > 0) {
    extend(addToSet, {
      suppliers_org: { $each: parsed.suppliers_org.map(s => simpleName(s)) },
    });
  }
  if (compact(parsed.suppliers_person).length > 0) {
    extend(addToSet, {
      suppliers_person: {
        $each: parsed.suppliers_person.map(s => simpleName(s)),
      },
    });
  }
  if (parsed.references && parsed.references.filter(o => (o.url)).length > 0) {
    extend(addToSet, {
      references: {
        $each: parsed.references.filter(o => (o.url)),
      },
    });
  }
  if (!isEmpty(addToSet)) {
    extend(mod, { $addToSet: addToSet });
  }
  tmpContracts.upsert({
    ocid: parsed.ocid,
  }, mod);
}
