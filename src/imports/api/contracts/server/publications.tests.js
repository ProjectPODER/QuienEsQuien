import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'chai';
import { forEach, indexOf } from 'lodash';
import { Contracts } from '../contracts.js';
import './publications.js';

describe('Publications of "Contracts" collection', () => {

  var contract_id;
  var dependency_string = 'Dependency';
  var supplier_string = 'Supplier';

  before(function() {
    resetDatabase();
    contract_id = Contracts.insert({
      dependency: dependency_string,
      suppliers_org: [ supplier_string ],
      department: 'Department',
      title: 'Title',
      type: 'Servicios',
      amount: 123,
      currency: 'USD',
      country: 'MX',
      ocid: 'OCDS-0UD2Q6-AA-011C00999-N195-2013',
      references: [{ url: 'www.referece.ak' }],
      user_id: Random.id()});
  });

  after(function() {
    resetDatabase();
  });

  it('should return data for contract "detail" views', (done) => {

    const collector = new PublicationCollector();

    collector.collect('contract', contract_id, collections => {
      assert.typeOf(collections.contracts, 'array');
      assert.equal(collections.contracts.length, 1, 'collects 1 document');
      done();
    });
  });

});
