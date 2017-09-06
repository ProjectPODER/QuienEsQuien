import { assert } from 'chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Tmp } from '../tmp.js';
import './publications.js';

describe('Publications of "Tmp" collection', () => {

  before(function() {
    resetDatabase();
    Tmp.insert({name:'Name'});

    var admin_user = {
      username: 'Admin User',
      password: '123456',
      email: 'admin@example.com'
    };

    var normal_user = {
      username: 'Normal User',
      password: '123456',
      email: 'normal@example.com'
    };

    admin_user_id = Accounts.createUser(admin_user)
    normal_user_id = Accounts.createUser(normal_user)

    Roles.addUsersToRoles(admin_user_id, 'admin')
  });

  after(function() {
    resetDatabase();
  });

  it('should not return data for tmp table if user has not logged in', (done) => {

    const collector = new PublicationCollector();

    collector.collect('tmp', collections => {
      assert.isUndefined(collections.tmp);
      done();
    });
  });

  it('should not return data for tmp table if user is not admin', (done) => {

    const collector = new PublicationCollector({userId: normal_user_id});

    collector.collect('tmp', collections => {
      assert.isUndefined(collections.tmp);
      done();
    });

  });

  it('should return data for tmp table if user is admin', (done) => {

    const collector = new PublicationCollector({userId: admin_user_id});

    collector.collect('tmp', collections => {
      assert.typeOf(collections.tmp, 'array');
      assert.equal(collections.tmp.length, 1, 'collects 1 document');
      done();
    });

  });

});
