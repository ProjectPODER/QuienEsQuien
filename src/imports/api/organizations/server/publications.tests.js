import { assert } from 'chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { forEach, indexOf } from 'lodash';
import { Orgs } from '../organizations.js';
import './publications.js';

describe('Publications of "Orgs" collection', () => {

  let org_id;

  before(function() {
    resetDatabase();
    org_id = Orgs.insert({simple:'organization', name: 'Organization', names: ['Organization'], user_id: Random.id()});
  });

  after(function() {
    resetDatabase();
  });

  it('should return data for first section of organization "detail" views', (done) => {

    const collector = new PublicationCollector();

    collector.collect('org', org_id, collections => {
      assert.typeOf(collections.organizations, 'array');
      assert.equal(collections.organizations.length, 1, 'collects 1 document');
      done();
    });
  });

});
