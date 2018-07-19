import { ContractsOCDS } from '../contracts_ocds.js';

Meteor.publish("contract_ocds", function(_id) {
  check(_id, String);
  return ContractsOCDS.find({ $or: [
    { ocid: _id },
    { id: _id },
    { _id: _id }
  ]});
});
