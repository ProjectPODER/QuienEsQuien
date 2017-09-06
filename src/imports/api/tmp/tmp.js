import { Mongo } from 'meteor/mongo';

export const Tmp = new Mongo.Collection("tmp");

Tmp.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Tmp.allow({
  remove: function(userId, doc) {
    return Roles.userIsInRole(userId, 'admin')
  }
});
