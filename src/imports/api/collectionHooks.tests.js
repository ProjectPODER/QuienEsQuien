/* eslint-env mocha */
import {
  resetDatabase
} from 'meteor/xolvio:cleaner';
import {
  assert
} from 'chai';
import {
  Orgs
} from './organizations/organizations.js';
import {
  Persons
} from './persons/persons.js';
import {
  testSample,
} from './test-data.js';
import { dbOperators } from './parse/server'

let insertedId;

[
  Orgs,
  Persons,
  // Contracts, FIXME contracts use a different dbOperators
].forEach(collection => {
  // console.log(testSample[collection._name]);

  const testDoc = testSample[collection._name][0];
  const controlSetter = dbOperators(testDoc);

  describe(`${collection._name} hooks`, function () {
    before(function () {
      resetDatabase();
    });

    beforeEach(function () {

      collection.upsert({
        simple: testDoc.simple,
      }, controlSetter);
    });

    afterEach(function () {
      insertedId = collection.remove({_id: insertedId});
    });

    it('Does not modify or add document when identical data is upserted a second time', () => {
      const before = collection.find({ simple: testDoc.simple }).fetch();

      collection.upsert({
        simple: testDoc.simple,
      }, controlSetter);

      const after = collection.find({ simple: testDoc.simple }).fetch();
      assert.strictEqual(after.length, 1); // make sure we didn't create a // new doc
      assert.deepEqual(before[0], after[0]);
    });

    it('Modifies document when top level attribute changes', () => {
      const before = collection.find({ simple: testDoc.simple }).fetch();
      const doc = Object.assign({},
        testDoc,
        { source: 'Hey its a Coool source!!' }
      );
      const setter = dbOperators(doc);

      collection.upsert({
        simple: doc.simple,
      }, setter);

      const after = collection.find({ simple: testDoc.simple }).fetch();
      assert.strictEqual(after.length, 1);
      assert.notDeepEqual(before[0], after[0]);
      assert.strictEqual(after[0].description, doc.description);
    });
  });
});
