import { resetDatabase } from 'meteor/xolvio:cleaner';
import SimpleSchema from 'simpl-schema';
import { Persons } from '../persons.js'
import { Memberships } from '../../memberships/memberships';
import { Contracts } from '../../contracts/contracts';
import { person, newMember, testDoc, testMemberships, testContracts } from './persons.test-data.js';
import { upsertFunction } from '../../lib.js';
import { map, merge, add } from 'lodash';
import { assert } from 'chai';  // Using Assert style

const userId = Random.id();
person.user_id = userId;
testDoc.user_id = userId;

describe('Person Relationships', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('Associates board memberships for given person', () => {
    Persons.insert(testDoc);
    testMemberships.forEach(doc => Memberships.insert(doc));
    const board = Persons.findOne({ simple: testDoc.simple }).board().fetch();
    assert.strictEqual(board.length, 2);
  });

  it('Associates shares for given person', () => {
    Persons.insert(testDoc);
    testMemberships.forEach(doc => Memberships.insert(doc));
    const shares = Persons.findOne({ simple: testDoc.simple }).shares().fetch();
    const total = [27.43, 0.49].reduce(add);
    assert.strictEqual(shares.length, 2, 'Wrong number of documents');
    assert.strictEqual(map(shares, 'shares').reduce(add), total, 'Shares result in incorrect sum');
  });

  it('Associates contracts provided by given person', () => {
    Persons.insert(testDoc);
    testContracts.forEach((doc) => {
      doc.user_id = userId;
      Contracts.insert(doc);
    });
    const contracts = Persons.findOne({ simple: testDoc.simple }).suppliesContracts().fetch();
    assert.strictEqual(contracts.length, 2, 'Wrong number of documents');
  });
});

describe('Person upsert integrity', function () {

  before(function(){

    resetDatabase();

  });

  it('Inserts a new person', function () {

    let result = upsertFunction(Persons, person);

    assert.isString(result.insertedId);
    assert.match(result.insertedId, SimpleSchema.RegEx.Id);
  });

  it('Does not modify document when identical data is upserted a second time', function () {

    let before = Persons.find({name: person.name}).fetch();

    let result = upsertFunction(Persons, person);

    let after = Persons.find({name: person.name}).fetch();

    assert.strictEqual(after.length, 1); // make sure we didn't create a new doc
    assert.deepEqual(before[0], after[0]);
  });

//	it('Modifies document when top level attribute changes', function () {
//		let before = Persons.find({name: person.name}).fetch();
//		person.gender = 'Male';
//
//		let result = upsertFunction(Persons, person);
//
//		let after = Persons.find({name: person.name}).fetch();
//		chai.assert.strictEqual(after.length, 1);
//		chai.assert.notDeepEqual(before[0], after[0]);
//		chai.assert.strictEqual(after[0].gender, 'Male');
//		// we should get a new revision
//
//	});
//
//	it('Modifies document when membships array changes', function () {
//		let before = Persons.find({name: person.name}).fetch();
//		let doc = merge({}, before[0]);
//		doc.memberships.push(newMember);
//
//		let result = upsertFunction(Persons, doc);
//
//		let after = Persons.find({name: doc.name}).fetch();
//		chai.assert.strictEqual(after.length, 1);
//		chai.assert.notDeepEqual(before[0], after[0]);
//    chai.assert.strictEqual(after[0].memberships[after[0].memberships.length -1 //].name, newMember.name);
//	});

//  it('Modifies document when sub document is removed from membships array', //function () {
//		let before = Persons.find({name: person.name}).fetch();
//    let doc = merge({}, before[0]);
//    doc.memberships.splice(1, 1);
//
//		let result = upsertFunction(Persons, doc);
//
//		let after = Persons.find({name: doc.name}).fetch();
//
//    chai.assert.strictEqual(after.length, 1);
//		chai.assert.notDeepEqual(before[0], after[0]);
//    // we should now have a simgle member
//    chai.assert.strictEqual(after[0].memberships.length, 1);
//
//	});

});
