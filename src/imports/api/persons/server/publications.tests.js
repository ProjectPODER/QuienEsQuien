/* eslint-env mocha */
import { assert } from 'chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Persons } from '../persons.js';
import './publications.js';

describe('Publications of "Persons" collection', () => {

  var person_id;

  before(function() {
    resetDatabase();
    person_id = Persons.insert({name:'Person', simple: 'person', names: ['Person'], user_id: Random.id()});
  });

  after(function() {
    resetDatabase();
  });

  it('should return data for person "detail" views', (done) => {

    const collector = new PublicationCollector();

    collector.collect('person', person_id, collections => {
      assert.typeOf(collections.persons, 'array');
      assert.equal(collections.persons.length, 1, 'collects 1 document');
      done();
    });
  });

});
