import {
  Mongo
} from 'meteor/mongo';
import MembershipSchema from './schema';

const Memberships = new Mongo.Collection('memberships');

Memberships.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});

Memberships.attachSchema(MembershipSchema);

export default Memberships;
