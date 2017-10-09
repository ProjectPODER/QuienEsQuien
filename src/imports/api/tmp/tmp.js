import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';

const Tmp = new Mongo.Collection("tmp");

Tmp.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Tmp.allow({
  remove: function(userId) {
    return Roles.userIsInRole(userId, 'admin')
  }
});

export default Tmp;
