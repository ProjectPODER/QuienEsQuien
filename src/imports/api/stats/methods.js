import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Orgs } from '../organizations/organizations.js';
import { Persons } from '../persons/persons.js';
import { Contracts } from '../contracts/contracts.js';
import { ContractsOCDS } from '../contracts_ocds/contracts_ocds.js';

export const counter = new ValidatedMethod({
  name: 'Stats.methods.counter',
  validate: null,
  run() {
    return [ Orgs.find().count(), Persons.find().count(), Contracts.find().count(), ContractsOCDS.find().count() ];
  }
});

export const currentDate = new ValidatedMethod({

  name: 'Stats.methods.currentDate',
  validate: null,
  run() {
    return [ Orgs.find( {}, {limit: 1, sort: {lastModified: -1}} ).fetch(), ContractsOCDS.find( {}, {limit: 1, sort: {date: -1}} ).fetch() ];
  }
});