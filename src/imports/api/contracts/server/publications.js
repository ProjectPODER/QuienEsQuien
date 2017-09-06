import { Contracts } from '../contracts.js';

Meteor.publish("contract", function(_id) {
  check(_id, String);
  return Contracts.find({ $or: [
    { ocid: _id },
    { _id: _id }
  ]});
});
