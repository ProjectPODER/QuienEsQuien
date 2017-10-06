import { resetDatabase } from 'meteor/xolvio:cleaner';
import SimpleSchema from 'simpl-schema';
import { assert } from 'chai';
import { Orgs } from '../organizations.js';
import Memberships from '../../memberships/memberships';
import { Contracts } from '../../contracts/contracts';
import { test_doc, testDoc, testMemberships, testContracts, newMember } from './organizations.test-data.js';
import { upsertFunction } from '../../lib.js';
import { add, merge, map, uniq } from 'lodash';

const userId = Random.id();
test_doc.user_id = userId;
testDoc.user_id = userId;

describe('Organization Relationships', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('Associates board memberships for given organization', () => {
    Orgs.insert(testDoc);
    testMemberships.forEach(doc => Memberships.insert(doc));
    const board = Orgs.findOne({ simple: testDoc.simple }).board().fetch();
    assert.strictEqual(board.length, 3);
    assert.deepEqual(map(board, 'person_id'), ['liping qiu', 'sean s shao', 'zhao phd qian jd']);
  });

  it('Associates shareholder memberships for given organization', () => {
    Orgs.insert(testDoc);
    testMemberships.forEach(doc => Memberships.insert(doc));
    const shareholders = Orgs.findOne({ simple: testDoc.simple }).shareholders().fetch();
    assert.strictEqual(shareholders.length, 3);
    assert.deepEqual(map(shareholders, 'org_id'), ['avetrana tre srl', 'carmiano due srl', 'changzhou trina solar energy co ltd']);
  });

  it('Associates shares for given organization', () => {
    Orgs.insert(testDoc);
    testMemberships.forEach(doc => Memberships.insert(doc));
    const shares = Orgs.findOne({ simple: testDoc.simple }).shares().fetch();
    const total = [2.89, 14.84, 14.66].reduce(add);
    assert.strictEqual(shares.length, 3, 'Wrong number of documents');
    assert.strictEqual(map(shares, 'shares').reduce(add), total, 'Shares result in incorrect sum');
  });

  // it('Associates contracts provided by given organization', () => {
  //   Orgs.insert(testDoc);
  //   testContracts.forEach((doc) => {
  //     doc.user_id = userId;
  //     Contracts.insert(doc);
  //   });
  //   const contracts = Orgs.findOne({ simple: testDoc.simple // }).suppliesContracts().fetch();
  //   assert.strictEqual(contracts.length, 2, 'Wrong number of documents');
  //   assert.deepEqual(['trina solar limited'], uniq(map(contracts, // 'proveedor')), 'All contracts are provided by given Organization');
  // });
  it('Associates contracts solicited by given organization', () => {
    Orgs.insert(testDoc);
    testContracts.forEach((doc) => {
      doc.user_id = userId;
      Contracts.insert(doc);
    });
    const contracts = Orgs.findOne({ simple: testDoc.simple }).contracts().fetch();
    const total = [1365334.53, 597990.45].reduce(add);
    assert.strictEqual(contracts.length, 2, 'Wrong number of documents');
    assert.deepEqual(map(contracts, 'amount').reduce(add), total, 'Amount results in correct sum');
  });
});

describe('Organization upsert integrity', function () {
  before(function () {
    resetDatabase();
  });

  it('Inserts a new organization document', function () {
    let result = upsertFunction(Orgs, test_doc);
    assert.isString(result.insertedId);
    assert.match(result.insertedId, SimpleSchema.RegEx.Id);
  });
});
