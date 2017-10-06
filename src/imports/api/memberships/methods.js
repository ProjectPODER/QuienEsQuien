import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Memberships from './memberships';

export default new ValidatedMethod({
  name: 'Memberships.methods.update',
  validate(args){
    Memberships.simpleSchema().validator(args.modifier, { modifier: true });
  },
  run({ _id, modifier }) {
    return Memberships.update({
      _id: _id
    }, modifier );
  }
});
