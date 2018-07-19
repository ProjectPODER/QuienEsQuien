import {
  Mongo,
} from 'meteor/mongo';

export const ContractsOCDS = new Mongo.Collection('contracts_ocds');


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
