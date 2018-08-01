import { BrowserPolicy } from 'meteor/browser-policy';
import { Roles } from 'meteor/alanning:roles';
import { Orgs } from '../../api/organizations/organizations.js';
import { Persons } from '../../api/persons/persons.js';
import { Contracts } from '../../api/contracts/contracts.js';
import { Feeds, FeedEntries } from '../../api/feeds.js';

BrowserPolicy.content.allowSameOriginForAll();
BrowserPolicy.content.allowScriptOrigin("www.quienesquien.wiki");
BrowserPolicy.content.allowImageOrigin("rindecuentas.org");
BrowserPolicy.content.allowImageOrigin("www.rindecuentas.org");
BrowserPolicy.content.allowFontOrigin("fonts.gstatic.com");
BrowserPolicy.content.allowStyleOrigin("fonts.googleapis.com");

Meteor.startup(() => {
  // we can use the name for text index as that should cover most cases in the names array
  Orgs._ensureIndex({
    name: 'text',
  }, {
    background: true,
  });
  Persons._ensureIndex({
    name: 'text',
  }, {
    background: true,
  });
  Contracts._ensureIndex({
    title: 'text',
  }, {
    background: true,
  });

  if (Meteor.users.find().count() === 0) {
    const users = [{
      username: 'Roger Stern',
      password: '123456',
      email: 'rs@alguno.org',
      roles: ['admin'],
    }, {
      username: 'Rosie Perez',
      password: '123456',
      email: 'rosie@nose.com',
      roles: ['editor'],
    }, {
      username: 'Bessie Smith',
      password: '123456',
      email: 'olbess@radar.io',
      roles: ['editor', 'NAICM'],
    }];

    users.forEach((user) => {
      const id = Accounts.createUser({
        email: user.email,
        password: user.password,
        username: user.username,
        roles: user.roles,
      });

      if (user.roles.length > 0) {
        Roles.addUsersToRoles(id, user.roles);
      }
    });
    process.stdout.write('Added User Fixtures');
  }

  feedReader();
});

function feedReader() {
  // pass the created collections to Feed.collections()
  var collections = {
      feeds: Feeds,
      feed_entries: FeedEntries
  }

  // console.log("Feed",Feeds);

  Feed.collections(collections);


  Feed.createAtomFeed({
      _id: "Rindecuentas",
      category: "RSS",
      link: "https://www.rindecuentas.org/feed/",
      refresh_interval: 70000
  });


  Feed.read();

  Meteor.publish("feed_entries", function() {
    return FeedEntries.find({});
  })
}
