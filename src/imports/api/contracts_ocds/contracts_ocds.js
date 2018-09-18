import {
  Mongo,
} from 'meteor/mongo';
import {
  ContractFlags
} from '../contract_flags/contract_flags';

export const ContractsOCDS = new Mongo.Collection('contracts_ocds');

ContractsOCDS.helpers({
  currency() {
    return this.contracts[0].value.currency;
  },
  startDate() {
    return new Date(this.contracts[0].period.startDate);
  },
  flags(ocid) {
    c = ContractFlags.find({"ocid": ocid})
    return c;
  },
  endDate() {
    return new Date(this.contracts[0].period.endDate);
  },
  suppliers() {
    let suppliers = [];
    for (award in this.awards) {
        suppliers = suppliers.concat(this.awards[award].suppliers);
    }
    return suppliers;
  },
  procurementMethodMxCnet() {
    return this.tender.procurementMethodMxCnet.replace("Cuando Menos","").replace("Federal","")
  }
});

ContractsOCDS.deny({
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
