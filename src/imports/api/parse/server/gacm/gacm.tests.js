import {
  Random,
} from 'meteor/random';
import {
  resetDatabase,
} from 'meteor/xolvio:cleaner';
import {
  assert,
} from 'chai';
import { keys, difference, compact } from 'lodash';
import Papa from 'papaparse';
import fs from 'fs';
import {
  isEmptyObject,
  simpleName,
} from '../../../lib';
import {
  Persons,
} from '../../../persons/persons';
import {
  Orgs,
} from '../../../organizations/organizations';
import {
  Contracts,
} from '../../../contracts/contracts';
import AddressSchema from '../../../addresses/addresses';
import {
  genericDataFormat,
  NAICMImportRow,
  flushTemporaryCollections,
  zipper,
} from './index';
import {
  tmpOrgs,
  tmpPersons,
  tmpContracts,
} from '../index';
import { addressData, orgData, gacmOrgScheme, inverseData as inverseOrgData } from './organizations';
import { contractData, gacmContractScheme } from './contracts';
import { personData, gacmPersonScheme, inverseData as inversePersonData } from './persons';
import {
  fakeRows,
  FakeBoardOfOrg,
  FakeBoardOfPerson,
} from './gacm.test-data';

const NAICM_VERSION = 12;
const CSV_PATH = `${process.env.PWD}/tests/naicm_v${NAICM_VERSION}.csv`;
const CSV_DATA = fs.readFileSync(CSV_PATH, 'utf8');
const userId = Random.id();

function validateBySchema(object, schema) {
  const context = schema.newContext('gacmContext');
  const clean = context.clean(object);

  const isValid = context.validate(clean);
  if (isValid) return clean;

  const errors = context.validationErrors().map(error =>
     ({
       name: error.name,
       type: error.type,
       details: {
         value: error.value,
       },
     }),
  );

  const message = '(Validation Error)' + errors.map(e =>
    `\n\t${e.name} : ${e.type} (${e.details.value})`,
  ).join();
  throw new Error(message);
}

const BP = Papa.parse(CSV_DATA, {
  delimiter: ',',
  header: true,
  preview: 5,
  encoding: 'UTF-8',
  dynamicTyping: true,
  skipEmptyLines: true,
});

describe('GACM CSV', () => {
  it('Has no headers containg spaces.', () => {
    BP.meta.fields.forEach((f) => {
      const u = f.split(' ');
      if (u.length > 1) {
        throw new Error(`Non conformant field '${f}'`);
      }
    });
  });

  it('Has headers which resemble specification.', () => {
    const wanted = ['CONTRACT', 'ORG', 'PERSON'];
    BP.meta.fields.forEach((f) => {
      const u = f.split('_');
      if (u.length < 2 || wanted.indexOf(u[0]) < 0) {
        throw new Error(`Non conformant field '${f}'`);
      }
    });
  });

  it('Fake_data fields resemble CSV', () => {
    const fakeKeys = keys(fakeRows[0]);
    const diff = difference(BP.meta.fields, fakeKeys);
    if (diff.length > 0) {
      throw new Error(`Non Standard Fields: ${diff}`);
    }
  });

  it('CONTRACT_NUM_PROC is defined where CONTRACT_ID is defined', () => {
    const BPX = Papa.parse(CSV_DATA, {
      delimiter: ',',
      header: true,
      encoding: 'UTF-8',
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    const f = BPX.data.filter(row => (row.CONTRACT_ID_STRING && !row.CONTRACT_NUM_PROC_STRING));
    if (compact(f).length > 0) {
      const missing = f.map(row => (row.CONTRACT_ID_STRING));
      throw new Error(`Undefined CONTRACT_NUM_PROC: ${missing}`);
    }
  });
});

describe('GACM CSV parser', () => {
  before(() => {
    resetDatabase();
  });

  it('correctly formats address data', () => {
    BP.data.forEach((row) => {
      const data = genericDataFormat(row);
      const org = data[1];
      const parsed = addressData(org);
      validateBySchema(parsed, AddressSchema);
    });
  });

  it('correctly formats org data', () => {
    BP.data.forEach((row) => {
      const data = genericDataFormat(row);
      const org = data[1];
      const parsed = orgData(org);
      parsed.user_id = userId;
      validateBySchema(parsed, Orgs.simpleSchema());
    });
  });

  it('correctly formats contract data', () => {
    BP.data.forEach((row) => {
      const data = genericDataFormat(row);
      const contract = data[2];
      const parsed = contractData(contract);
      parsed.user_id = userId;
      validateBySchema(parsed, Contracts.simpleSchema());
    });
  });

  it('correctly formats person data', () => {
    BP.data.forEach((row) => {
      const data = genericDataFormat(row);
      const person = data[0];
      if (!isEmptyObject(person)) {
        const parsed = personData(person);
        parsed.user_id = userId;
        Persons.simpleSchema().clean(parsed);
        validateBySchema(parsed, Persons.simpleSchema());
      }
    });
  });
});

// describe('GACM fake data rutine', () => {
//   beforeEach(() => {
//     resetDatabase();
//   });
//
//   it('inserts correct number of persons and related data', () => {
//     fakeRows.forEach((row) => {
//       const data = genericDataFormat(row);
//       const person = data[0];
//
//       if (!isEmptyObject(person)) {
//         gacmPersonScheme(person);
//       }
//     });
//     assert.strictEqual(tmpPersons.find().count(), 3);
//     assert.strictEqual(tmpOrgs.find().count(), 5);
//     assert.strictEqual(Memberships.find().count(), 27);
//   });
//
//   it('inserts correct number of orgs and related data', () => {
//     fakeRows.forEach((row) => {
//       const data = genericDataFormat(row);
//       const org = data[1];
//
//       if (!isEmptyObject(org)) {
//         gacmOrgScheme(org);
//       }
//     });
//
//     assert.strictEqual(tmpPersons.find().count(), 3);
//     assert.strictEqual(tmpOrgs.find().count(), 21);
//     assert.strictEqual(Memberships.find().count(), 42);
//   });
//
//   it('inserts correct number of contracts and related data', () => {
//     fakeRows.forEach((row) => {
//       const data = genericDataFormat(row);
//       const contract = data[2];
//
//       if (!isEmptyObject(contract)) {
//         gacmContractScheme(contract);
//       }
//     });
//
//     assert.strictEqual(tmpPersons.find().count(), 3);
//     assert.strictEqual(tmpOrgs.find().count(), 3);
//     assert.strictEqual(tmpContracts.find().count(), 3);
//   });
//
//   it('correctly inserts all data', () => {
//     // serialize inserted documenets
//     // compare values w/ CSV
//     // make sure we do not loose any valueus
//     fakeRows.forEach((row) => {
//       const data = genericDataFormat(row);
//       NAICMImportRow(data, userId);
//     });
//     assert.strictEqual(tmpOrgs.find().count(), 27);
//     assert.strictEqual(tmpContracts.find().count(), 3);
//     assert.strictEqual(tmpPersons.find().count(), 6);
//   });
// });

describe('GACM fake data validators', () => {
  before(() => {
    resetDatabase();
  });

  it('correctly formats address data', () => {
    fakeRows.forEach((row) => {
      const data = genericDataFormat(row);
      const org = data[1];
      const parsed = addressData(org);
      validateBySchema(parsed, AddressSchema);
    });
  });

  it('correctly formats org data', () => {
    fakeRows.forEach((row) => {
      const data = genericDataFormat(row);
      const org = data[1];
      const parsed = orgData(org);
      parsed.user_id = userId;
      validateBySchema(parsed, Orgs.simpleSchema());
    });
  });

  it('correctly formats contract data', () => {
    fakeRows.forEach((row) => {
      const data = genericDataFormat(row);
      const contract = data[2];
      const parsed = contractData(contract);
      parsed.user_id = userId;
      validateBySchema(parsed, Contracts.simpleSchema());
    });
  });

  it('correctly formats person data', () => {
    fakeRows.forEach((row) => {
      const data = genericDataFormat(row);
      const person = data[0];
      if (!isEmptyObject(person)) {
        const parsed = personData(person);
        parsed.user_id = userId;
        Persons.simpleSchema().clean(parsed);
        validateBySchema(parsed, Persons.simpleSchema());
      }
    });
  });

  it('correctly zips board membership of person', () => {
    const INDEX = 1;
    const data = FakeBoardOfPerson;

    const zipped = zipper(INDEX, data, 'board');
    assert.strictEqual(zipped.role, data.board_role[INDEX]);
    assert.strictEqual(zipped.department, 'board');
    assert.strictEqual(zipped.start_date.toISOString(), data.board_start_date[INDEX].toISOString());
    assert.strictEqual(zipped.end_date.toISOString(), data.board_end_date[INDEX].toISOString());
  });

  it('correctly zips board membership of org', () => {
    const INDEX = 1;
    const data = FakeBoardOfOrg;

    const zipped = zipper(INDEX, data, 'board');

    assert.strictEqual(zipped.role, data.board_role[INDEX]);
    assert.strictEqual(zipped.department, 'board');
    assert.strictEqual(zipped.start_date.toISOString(), data.board_start_date[INDEX].toISOString());
    assert.strictEqual(zipped.end_date.toISOString(), data.board_end_date[INDEX].toISOString());
  });

  it('correctly formats board membership of person', () => {
    const INDEX = 1;
    const PERSON_NAME = 'Roger P. Stuart';
    const data = FakeBoardOfPerson;

    const zipped = zipper(INDEX, data, 'board');
    zipped.org = data.board[INDEX];
    const member = inversePersonData(zipped, PERSON_NAME);
    assert.strictEqual(member.sob_org, simpleName(data.board[INDEX]));
    assert.strictEqual(member.person, PERSON_NAME);
    assert.strictEqual(member.person_id, simpleName(PERSON_NAME));
    assert.strictEqual(member.role, data.board_role[INDEX]);
    assert.strictEqual(member.department, 'board');
    assert.strictEqual(member.start_date.toISOString(), data.board_start_date[INDEX].toISOString());
    assert.strictEqual(member.end_date.toISOString(), data.board_end_date[INDEX].toISOString());
  });

  it('correctly formats board membership of org', () => {
    const INDEX = 1;
    const ORG_NAME = 'Barrows Inc';
    const data = FakeBoardOfOrg;

    const zipped = zipper(INDEX, data, 'board');
    zipped.person = data.board[INDEX];
    const member = inverseOrgData(zipped, ORG_NAME);
    assert.strictEqual(member.sob_org, simpleName(ORG_NAME));
    assert.strictEqual(member.person, data.board[INDEX]);
    assert.strictEqual(member.person_id, simpleName(data.board[INDEX]));
    assert.strictEqual(member.role, data.board_role[INDEX]);
    assert.strictEqual(member.department, 'board');
    assert.strictEqual(member.start_date.toISOString(), data.board_start_date[INDEX].toISOString());
    assert.strictEqual(member.end_date.toISOString(), data.board_end_date[INDEX].toISOString());
  });
});
