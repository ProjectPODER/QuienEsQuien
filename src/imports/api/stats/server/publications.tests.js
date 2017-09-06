import { assert } from 'chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { Stats } from '../stats.js';
import './publications.js';

describe('Publications of "Stats" collection', () => {

  before(function() {
    resetDatabase();
    Stats.insert({bmv_org_inserts:123});

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

  it('should not return data for statistics table if user has not logged in', (done) => {

    const collector = new PublicationCollector();

    collector.collect('statistics', collections => {
      assert.isUndefined(collections.statistics);
      done();
    });
  });

  it('should not return data for statistics table if user is not admin', (done) => {

    const collector = new PublicationCollector({userId: normal_user_id});

    collector.collect('statistics', collections => {
      assert.isUndefined(collections.statistics);
      done();
    });

  });

  it('should return data for statistics table if user is admin', (done) => {

    const collector = new PublicationCollector({userId: admin_user_id});

    collector.collect('statistics', collections => {
      assert.typeOf(collections.statistics, 'array');
      assert.equal(collections.statistics.length, 1, 'collects 1 document');
      done();
    });

  });

});
