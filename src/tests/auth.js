describe('User has not logged in', function () {

  it('doesnt display form of "/persons/add/" route @watch', function () {
    browser.url('http://localhost:3000/persons/add/');
    var forbidden = browser.waitForExist('#updatePersonForm', undefined, true);
    assert.strictEqual(forbidden, true);
  });

  it('says you are not allowed to view "/persons/add/" route @watch', function () {
    browser.url('http://localhost:3000/persons/add/');
    var unauthorized = browser.waitForExist('#unauthorized');
    assert.strictEqual(unauthorized, true);
  });

  it('doesnt display form of "/orgs/add/" route @watch', function () {
    browser.url('http://localhost:3000/orgs/add/');
    var forbidden = browser.waitForExist('#updateOrgForm', undefined, true);
    assert.strictEqual(forbidden, true);
  });

  it('says you are not allowed to view "/orgs/add/" route @watch', function () {
    browser.url('http://localhost:3000/orgs/add/');
    var unauthorized = browser.waitForExist('#unauthorized');
    assert.strictEqual(unauthorized, true);
  });

  it('doesnt display dropzone of "/stats/" route @watch', function () {
    browser.url('http://localhost:3000/stats/');
    var forbidden = browser.waitForExist('#dropzone', undefined, true);
    assert.strictEqual(forbidden, true);
  });

  it('says you are not allowed to view "/stats/" route @watch', function () {
    browser.url('http://localhost:3000/stats/');
    var unauthorized = browser.waitForExist('#unauthorized');
    assert.strictEqual(unauthorized, true);
  });

  it('doesnt display table of "/lost/" route @watch', function () {
    browser.url('http://localhost:3000/lost/');
    var forbidden = browser.waitForExist('#table_lost', undefined, true);
    assert.strictEqual(forbidden, true);
  });

  it('says you are not allowed to view "/lost/" route @watch', function () {
    browser.url('http://localhost:3000/lost/');
    var unauthorized = browser.waitForExist('#unauthorized');
    assert.strictEqual(unauthorized, true);
  });

})
