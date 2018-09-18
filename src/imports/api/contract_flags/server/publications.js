import { ContractFlags } from '../contract_flags.js';

Meteor.publish("contract_flags", function(_id,supplier_id) {
  check(_id, String);
  check(supplier_id, String);
  let query = {
    $and: [
      { "ocid": _id },
      { "parties.id": supplier_id }
    ]
  };
  // console.log("contract_flags",query,ContractFlags.find(query),ContractFlags.find(query).fetch());
  return ContractFlags.find(query);
});
