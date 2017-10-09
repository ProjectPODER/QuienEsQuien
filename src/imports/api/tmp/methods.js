import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { orgFromTmp, personFromTmp } from './lib.js';
import { OrganizationSchema } from '../organizations/schema.js';
import { PersonSchema } from '../persons/schema.js';

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
