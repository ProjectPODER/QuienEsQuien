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
    },
    limit: 200
  });
});

Meteor.publish("contracts-by-buyer-ocds", function(party_name) {
  check(party_name, String);
  return ContractsOCDS.find(
    {$or:
      [
        { "buyer": {$regex: party_name, $options: "i"} },
        { "parties.0.memberOf.name": {$regex: party_name, $options: "i"} }
      ]
    }
  , {
    sort: {
      amount: -1
    },
    limit: 200
  });
});
