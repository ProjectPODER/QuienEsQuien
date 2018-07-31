import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Orgs } from '../organizations/organizations.js';
import { Persons } from '../persons/persons.js';
import { Contracts } from '../contracts/contracts.js';
import { ContractsOCDS } from '../contracts_ocds/contracts_ocds.js';

export default new ValidatedMethod({
  name: 'Stats.methods.counter',
  validate: null,
  run() {
    return [ Orgs.find().count(), Persons.find().count(), Contracts.find().count(), ContractsOCDS.find().count() ];
  }
});
