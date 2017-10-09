import { map, filter, isString } from 'lodash';
import { Revisions } from '../../revisions/revisions.js';
import { userLog } from '../../users/users.js';

Meteor.publish("userLog", function (userId) {
  check(userId, String);
  let entries = userLog.find({
    user_id: userId,
  }, {
    limit: 100,
    sort: { date: -1 },
  });
  const updates = filter(entries.fetch(), e => (e.action === 'update'));
  const revIds = map(updates, 'dId')
  .filter(s => (isString(s))); // make sure its a string
  const revisions = Revisions.find({ _id: { $in: revIds } });
  return [
    entries,
    revisions,
  ];
});

Meteor.publish("userRevisions", function (userId) {
  check(userId, String);
  return Revisions.find({ 'updates.user_id': userId }, { documentId: 1 });
});
