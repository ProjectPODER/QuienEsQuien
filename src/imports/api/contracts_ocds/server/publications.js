import { ContractsOCDS } from '../contracts_ocds.js';
import {
  ContractFlags
} from '../../contract_flags/contract_flags';


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
      { "awards.0.suppliers.0.id": supplier_id }
  , {
    sort: {
      amount: -1
    },
    "contracts.0.value.amount": 200
  });
});

Meteor.publish("contracts-by-buyer-ocds", function(buyer_id) {
  check(buyer_id, String);
  return ContractsOCDS.find(
    {$or:
      [
        { "buyer.id": buyer_id },
        { "parties.0.memberOf.id": buyer_id }
      ]
    }
  , {
    sort: {
      "contracts.0.value.amount": -1
    },
    limit: 200
  });
});
