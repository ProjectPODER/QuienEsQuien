import { ContractsOCDS } from '../contracts_ocds.js';

Meteor.publish("contract_ocds", function(_id) {
  check(_id, String);
  return ContractsOCDS.find({ $or: [
    { ocid: _id },
    { id: _id },
    { _id: _id }
  ]});
});


Meteor.publish("contracts-by-supplier-ocds", function(supplier_id) {
  check(supplier_id, String);
  return ContractsOCDS.find(
      { "contracts.0.suppliers": {$regex: supplier_id, $options: "i"} }
  , {
    sort: {
      amount: -1
    }
  });
});
