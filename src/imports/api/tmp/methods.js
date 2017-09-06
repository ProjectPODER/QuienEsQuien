import { Tmp } from './tmp.js';
import { orgFromTmp, personFromTmp } from './lib.js';
import { OrganizationSchema } from '../organizations/schema.js';
import { Orgs } from '../organizations/organizations.js';
import { PersonSchema } from '../persons/schema.js';
import { Persons } from '../persons/persons.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { omit, extend } from 'lodash';

export const org_from_tmp = new ValidatedMethod({
  name: 'Tmp.methods.org_from_tmp',
  validate(args) {
    OrganizationSchema.validator(args.document);
  },
  run(args) {
    return orgFromTmp(args);
  }
});

export const person_from_tmp = new ValidatedMethod({
  name: 'Tmp.methods.person_from_tmp',
  validate(args) {
    PersonSchema.validator(args.document);
  },
  run(args) {
    return personFromTmp(args);
  }
});
