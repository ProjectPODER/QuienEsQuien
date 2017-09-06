import { Mongo } from 'meteor/mongo';

const LIMIT = 1000;

export const UserLog = new Mongo.Collection("userlog");

export function logUserAction(object) {
  const date = new Date();
  const doc = {
        dId: object._id,
        dName: object.simple,
        user_id: object.user_id,
        action: object.action, // action may be: insert, update, remove
                        // action: insert, dId: doc._id
                        // action: update, dId: revId
                        // action: remove, dId: doc._id
        date: date,
        collection: object.collection
  };
  const result = UserLog.insert(doc)
  return result;
}

UserLog.after.insert((userId, doc) => {
  const count = UserLog.find().count();
  if (count > LIMIT) {
    UserLog.find({}, { sort: { date: 1 }, limit: (count - LIMIT) })
    .forEach(entry => (UserLog.remove({ _id: entry._id })));
  }
});

UserLog.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
