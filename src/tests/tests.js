const test_org = {
  name: "My Favorite Organization 2",
  source: "BMV",
  foundation_date: "1945",
  description: "Aéroports de Paris Société Anonyme owns and operates Paris-Charles de Gaulle, Paris-Orly, and Paris-Le Bourget airports in the Îlede-France region, France.",
}
const test_person = {
  name: "Willy McGee",
  gender: "male",
}

describe('quienesquien.wiki', function () {

  it('can access site root @watch', function () {
    browser.url('http://localhost:3000');
    browser.waitForExist('.page-title');
    let title = browser.getText('.page-title');
    assert.strictEqual('Quién es Quién Wiki', title);
  });

  it('can access organization index @watch', function () {
    browser.url('http://localhost:3000/orgs');
  });

  it('can access an organization @watch', function () {
    browser.waitForExist('table');
    let row = browser.element('table tr:nth-Child(3) td:first-Child');
    let name = row.getText();
    row.click();
    browser.waitForExist('.viz-legend');
    let origin = browser.getText('.viz-legend li:first-Child');
    assert.strictEqual(origin, 'origin');
    browser.waitForExist('ul.tabs-list');
    browser.element('ul.tabs-list .tab-item:nth-Child(2)').click();
    browser.waitForExist('.description-data-name');
    let title = browser.getText('.description-data-name h3');
    assert.strictEqual(name, title);
  });

  it('can login @watch', function () {
    browser.waitForExist('.dropdown-toggle');
    browser.click('.dropdown-toggle');
    browser.setValue('#login-email', 'rs@alguno.org');
    browser.setValue('#login-password', '123456');
    browser.click('#login-buttons-password');
    browser.waitUntil(function () {
      return browser.getText('.dropdown-toggle') === 'Roger Stern'
    }, 5000, 'expected text to be different after 5s');
  });
  it('can edit an organization document @watch', function () {
    let description = 'Fake description';
    browser.waitForExist('.tabs-list');
    browser.element('.tabs-list li:nth-Child(3)').click();
    browser.setValue('input[name="description"]', description);
    browser.submitForm('#updateOrgForm');
    browser.pause(200);
    browser.element('.tabs-list li:nth-Child(2)').click();
    browser.waitForExist('.description-data-description');
    let desc = browser.getText('.description-data-description td:nth-Child(2)');
    assert.strictEqual(description, desc);
  });
  it('can access manual add from org detail @watch', function () {
    browser.waitForExist('#add_one');
    browser.click('#add_one');
    assert.equal(browser.url().value, 'http://localhost:3000/orgs/add');
  });
  it('can manually add an organization @watch', function () {
    browser.waitForExist('#updateOrgForm');
    browser.setValue('input[name="name"]', test_org.name);
    browser.setValue('input[name="description"]', test_org.description);
    browser.submitForm('#updateOrgForm');
    browser.pause(1000);
    browser.waitForExist('.description-data-name');
    let title = browser.getText('.description-data-name h3');
    assert.strictEqual(test_org.name, title);
    let description = browser.getText('.description-data-description td:nth-Child(2)');
    assert.strictEqual(test_org.description, description);
  });

  it('can access site root @watch', function () {
    browser.pause(200);
    browser.url('http://localhost:3000');
    browser.waitForExist('.page-title');
    let title = browser.getText('.page-title');
    assert.strictEqual('Quién es Quién Wiki', title);
  });

  it('can access person index @watch', function () {
    browser.url('http://localhost:3000/persons');
  });

  it('can access an person @watch', function () {
    browser.waitForExist('table');
    let row = browser.element('table tr:nth-Child(3) td:first-Child');
    let name = row.getText();
    row.click();
    browser.waitForExist('.viz-legend');
    let origin = browser.getText('.viz-legend li:first-Child');
    assert.strictEqual(origin, 'origin');
    browser.waitForExist('ul.tabs-list');
    browser.element('ul.tabs-list .tab-item:nth-Child(2)').click();
    browser.waitForExist('.description-data-name');
    let title = browser.getText('.description-data-name h3');
    assert.strictEqual(name, title);
  });
  it('can edit a person document @watch', function () {
    browser.waitForExist('.tabs-list');
    browser.element('.tabs-list li:nth-Child(3)').click();
    browser.setValue('input[name="nationality"]', 'Mexican');
    browser.submitForm('#updatePersonForm');
    browser.pause(200);
    browser.element('.tabs-list li:nth-Child(2)').click();
    browser.waitForExist('.description-data-nationality');
    let nationality = browser.getText('.description-data-nationality td:nth-Child(2)');
    assert.strictEqual('Mexican', nationality);
  });
  it('can access manual add from person detail @watch', function () {
    browser.pause(200);
    browser.waitForExist('#add_one');
    browser.click('#add_one');
    assert.equal(browser.url().value, 'http://localhost:3000/persons/add');
  });

  it('can manually add a person document @watch', function () {
    browser.waitForExist('#updatePersonForm');
    browser.setValue('input[name="name"]', test_person.name);
    browser.setValue('input[name="nationality"]', 'Mexican');
    browser.submitForm('#updatePersonForm');
    browser.waitForExist('.description-data-name');
    let title = browser.getText('.description-data-name h3');
    assert.strictEqual(test_person.name, title);
    let nationality = browser.getText('.description-data-nationality td:nth-Child(2)');
    assert.strictEqual('Mexican', nationality);
  });

  it('can access stats @watch', function () {
    browser.url('http://localhost:3000/stats');
  });

  it('can access lost & found @watch', function () {
    browser.url('http://localhost:3000/lost');
    browser.waitForExist('.sidebar-item .selected');
    let title = browser.getText('.sidebar-item .selected');
    assert.strictEqual('Lost & Found', title);
    let rows = browser.elements("table.table tbody tr");
    assert.strictEqual(rows.value.length, 10);

  });

  it('can filter lost & found by org @watch', function () {
    browser.waitForExist('.reactive-table-options', 1000);
    browser.setValue('.reactive-table-input', 'Aeroports de Paris ESOP');
    browser.pause(500);
    let rows = browser.elements("table.table tbody tr");
    assert.strictEqual(rows.value.length, 1);
  });

  it('can move org from Tmp to Orgs @watch', function () {
    browser.click("table.table tbody tr:first-Child td:nth-Child(6) a.js-to-org");
    let html = browser.getHTML("table.table tbody");
    assert.match(html, /\<tbody\>\s*\<\/tbody\>/);
  });

  it('can filter lost & found by person @watch', function () {
    browser.waitForExist('.reactive-table-options', 1000);
    browser.setValue('.reactive-table-input', 'Félix Farachala');
    browser.pause(500);
    let rows = browser.elements("table.table tbody tr");
    assert.strictEqual(rows.value.length, 1);
  });

  it('can move person from Tmp to Persons @watch', function () {
    browser.click("table.table tbody tr:first-Child td:nth-Child(6) a.js-to-person");
    let html = browser.getHTML("table.table tbody");
    assert.match(html, /\<tbody\>\s*\<\/tbody\>/);
  });

  it('can access privacidad @watch', function () {
    browser.url('http://localhost:3000/privacy');
    browser.waitForExist('.page-title');
    let title = browser.getText('.page-title');
    assert.strictEqual('Aviso de Privacidad', title);
  });
  it('can access esquema @watch', function () {
    browser.url('http://localhost:3000/schema');
    browser.waitForExist('.page-title');
    let title = browser.getText('.page-title');
    assert.strictEqual('Schema', title);
  });
  it('can access acerca de @watch', function () {
    browser.url('http://localhost:3000/about');
    browser.waitForExist('.page-title');
    let title = browser.getText('.page-title');
    assert.strictEqual('QuiénEsQuiénWiki', title);
  });

  it('can access contact @watch', function () {
    browser.url('http://localhost:3000/contact');
    browser.waitForExist('#contactForm legend');
    let title = browser.getText('#contactForm legend');
    assert.strictEqual('Contact Us', title);
  });

  it('can send mail from contact form @watch', function () {
    browser.pause(200);
    browser.waitForExist('#contactForm legend');
    browser.setValue('input[name="name"]', 'Willy McGee');
    browser.setValue('input[name="subject"]', '¿Quién es Quién?');
    browser.setValue('input[name="email"]', 'wil@mc.com');
    browser.setValue('textarea[name="message"]', 'Me pregunto, al fin de cuentas, ¿quién ES quién?');
    browser.submitForm('#contactForm');
    browser.pause(200);
    browser.waitUntil(function () {
      return browser.getText('.page-title') === 'Success'
    }, 5000, 'expected title to be Success after 5s');
  });
  it('can logout @watch', function () {
    browser.pause(200);
    browser.waitForExist('.dropdown-toggle');
    browser.click('.dropdown-toggle');
    browser.click('#login-buttons-logout');
    browser.waitUntil(function () {
      return browser.getText('.dropdown-toggle') === 'Sign in / Join'
    }, 5000, 'expected text to be different after 5s');
  });
  it('redirects unknown page to home @watch', function () {
    browser.pause(200);
    browser.url('http://localhost:3000/szylsjdfljsadfj');
    browser.waitForExist('.page-title',4500);
    let title = browser.getText('.page-title');
    assert.strictEqual('Quién es Quién Wiki', title);
  });

});
