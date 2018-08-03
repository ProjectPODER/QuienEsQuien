import {
  Mongo,
} from 'meteor/mongo';

export const ContractsOCDS = new Mongo.Collection('contracts_ocds');

ContractsOCDS.helpers({
  amount() {
    return this.contracts[0].value.amount;
  },
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
    for (party in this.parties) {
      suppliers.push(party.name)
    }
    return suppliers;
  },
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
