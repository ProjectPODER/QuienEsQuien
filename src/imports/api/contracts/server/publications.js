import { Contracts } from '../contracts.js';

Meteor.publish("contract", function(_id) {
  check(_id, String);
  return Contracts.find({ $or: [
    { ocid: _id },
    { _id: _id }
  ]});
});

Meteor.publish("contracts-by-supplier", function(supplier_id) {
  check(supplier_id, String);
  return Contracts.find({ $or: [
    { suppliers_person: supplier_id },
    { suppliers_org: supplier_id }
  ]}, {
    sort: {
      amount: -1
    }
  });
});
