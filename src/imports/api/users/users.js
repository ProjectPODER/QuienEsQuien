import { Mongo } from 'meteor/mongo';

const LIMIT = 1000;

export const userLog = new Mongo.Collection("userlog");

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
  const result = userLog.insert(doc)
  return result;
}

userLog.after.insert(() => {
  const count = userLog.find().count();
  if (count > LIMIT) {
    userLog.find({}, { sort: { date: 1 }, limit: (count - LIMIT) })
    .forEach(entry => (userLog.remove({ _id: entry._id })));
  }
});

userLog.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
