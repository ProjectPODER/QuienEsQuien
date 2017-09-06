import {
  Mongo,
} from 'meteor/mongo';
import {
  snakeCase,
  mapKeys,
  zipObject,
  pickBy,
  isArray,
  flatten,
  omit,
  extend,
  isEmpty,
  compact,
} from 'lodash';
import {
  gacmPersonScheme,
} from './persons';
import {
  gacmOrgScheme,
} from './organizations';
import {
  gacmContractScheme,
} from './contracts';
import {
  csv_multi_value_to_array,
  nullify_invalid_values,
  convert_dates,
} from '../lib';
import {
  simpleName,
  isEmptyObject,
  omitEmpty,
} from '../../../lib';
import {
  Contracts,
} from '../../../contracts/contracts';
import {
  Orgs,
} from '../../../organizations/organizations';
import {
  Persons,
} from '../../../persons/persons';
import {
  Memberships,
} from '../../../memberships/memberships';
import {
  tmpContracts,
  tmpPersons,
  tmpOrgs,
} from '../index';

export const memberProps = [
  'role',
  'department',
  'start_date',
  'end_date',
  'shares',
];

function roleFromField(string) {
  let role = string.split(/_/)[0];
  if (role.slice(-1) === 's') {
    role = role.slice(0, -1);
  }
  return role;
}

export function zipper(index, data, string) {
  const o = zipObject(
    memberProps,
    [
      flatten([data[`${string}_role`]])[index],
      flatten([data[`${string}_department`]])[index],
      flatten([data[`${string}_start_date`]])[index],
      flatten([data[`${string}_end_date`]])[index],
      flatten([data[`${string}_shares`]])[index],
    ],
  );
  if (string === 'board') {
    o.department = 'board';
  }
  if (!o.role) {
    o.role = roleFromField(string);
  }
  return o;
}

export function baseMod(string, userId) {
  return {
    $setOnInsert: {
      simple: simpleName(string),
      name: string,
      names: [],
      user_id: userId,
      source: 'NAICM',
    },
    $addToSet: {
      names: string,
    },
  };
}

export function resetTemporaryCollections() {
  tmpPersons.remove({});
  tmpOrgs.remove({});
  tmpContracts.remove({});
}

export function dbOperators(doc, userId) {
  const setter = baseMod(doc.simple, userId);
  const addToSet = {};
  doc.source = 'NAICM';
  doc.user_id = userId;
  if (doc.contract_count) {
    setter.$inc = { contract_count: doc.contract_count };
  }
  if (compact(doc.names) > 0) {
    extend(addToSet, {
      names: {
        $each: doc.names,
      },
    });
  }
  if (compact(doc.parent) > 0) {
    extend(addToSet, {
      parent: {
        $each: doc.parent,
      },
    });
  }
  if (compact(doc.suborgs).length > 0) {
    extend(addToSet, {
      suborgs: {
        $each: doc.suborgs,
      },
    });
  }
  if (doc.references && doc.references.filter(o => (o.url)).length > 0) {
    extend(addToSet, {
      references: {
        $each: doc.references,
      },
    });
  }
  if (!isEmpty(addToSet)) {
    setter.$addToSet = addToSet;
  }
  setter.$set = omit(doc, [
    'references',
    'names',
    'name',
    'simple',
    'suborgs',
    'parent',
    'contract_count',
  ]);
  return setter;
}

function dbOperatorsContracts(doc, userId) {
  const setter = {};
  const addToSet = {};
  doc.source = 'NAICM';
  doc.user_id = userId;
  if (doc.suppliers_org) {
    extend(addToSet, {
      suppliers_org: {
        $each: doc.suppliers_org,
      },
    });
  }
  if (doc.suppliers_person) {
    extend(addToSet, {
      suppliers_person: {
        $each: doc.suppliers_person,
      },
    });
  }
  if (doc.suppliers) {
    extend(addToSet, {
      suppliers: {
        $each: doc.suppliers,
      },
    });
  }
  if (doc.references) {
    extend(addToSet, {
      references: {
        $each: doc.references,
      },
    });
  }
  if (!isEmpty(addToSet)) {
    setter.$addToSet = addToSet;
  }
  setter.$set = omit(doc, [
    'references',
    'suppliers_org',
    'suppliers_person',
    'suppliers',
  ]);
  return setter;
}

export function flushTemporaryCollections(userId) {
  console.log(`${tmpPersons.find().count()} temporary persons`);
  tmpPersons.find().forEach((doc) => {
    const setter = dbOperators(doc, userId);
    Persons.upsert({
      simple: doc.simple,
    }, setter);
  });

  console.log(`${tmpOrgs.find().count()} temporary organizations`);
  tmpOrgs.find().forEach((doc) => {
    const setter = dbOperators(doc, userId);
    Orgs.upsert({
      simple: doc.simple,
    }, setter);
  });

  console.log(`${tmpContracts.find().count()} temporary contracts`);
  tmpContracts.find().forEach((doc) => {
    const setter = dbOperatorsContracts(doc, userId);
    Contracts.upsert({
      ocid: doc.ocid,
    }, setter);
  });

  Meteor.setTimeout(() => {
    resetTemporaryCollections();
  }, 500);
}

export function NAICMImportRow(data, userId) {
  // expect an array of 3 Objects
  const [person, org, contract] = data;
  if (!isEmptyObject(person)) {
    gacmPersonScheme(person, userId);
  }
  if (!isEmptyObject(org)) {
    gacmOrgScheme(org, userId);
  }
  if (!isEmptyObject(contract)) {
    gacmContractScheme(contract, userId);
  }
  return true;
}

export function genericDataFormat(row) {
  // expects a single data object
  let data = mapKeys(row, (value, key) =>
    (snakeCase(key)),
  );
  data = csv_multi_value_to_array(data);
  data = mapKeys(data, (value, key) =>
    (key.replace(/_array|_string/, '')),
  );
  data = nullify_invalid_values(data);
  data = convert_dates(data);
  return ['person', 'org', 'contract']
    .map((string) => {
      const o = pickBy(data, (value, key) =>
        (key.split('_')[0] === string),
      );
      return mapKeys(o, (value, key) =>
        (key.split('_').slice(1).join('_')),
      );
    });
}

function referenceFormat(string) {
  return {
    url: string.replace(/.*?:\/\//g, ''),
  };
}

export function referenceData(data) {
  if (isArray(data.references)) {
    return data.references.map(u =>
      referenceFormat(u),
    );
  }

  return [
    referenceFormat(data.references),
  ];
}

export function updateMembers(o) {
  const object = o;
  object._id = Random.id();
  const setter = { $setOnInsert: omitEmpty(object) };
  if (object.shares) {
    extend(setter, { $set: object.shares });
  }
  Memberships.rawCollection().findAndModify(
    omitEmpty(omit(object, 'shares')),
    [],
    setter,
    {
      upsert: true,
      new: true,
    },
  );
}
