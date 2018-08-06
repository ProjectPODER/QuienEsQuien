import {
  Mongo,
} from 'meteor/mongo';

export const ContractsOCDS = new Mongo.Collection('contracts_ocds');

ContractsOCDS.helpers({
  currency() {
    return this.contracts[0].value.currency;
  },
  startDate() {
    return new Date(this.contracts[0].period.startDate);
  },
  endDate() {
    return new Date(this.contracts[0].period.endDate);
  },
  suppliers() {
    let suppliers = [];
    for (contract in this.contracts) {
      suppliers.push(this.contracts[contract].suppliers);
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
