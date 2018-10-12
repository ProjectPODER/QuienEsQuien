import {
  Meteor,
} from 'meteor/meteor';
import {
  ValidatedMethod,
} from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { simpleName } from '../lib';

export const partyFlagsAverage = new ValidatedMethod({
  name: 'Contracts.methods.partyFlagsAverage',

  validate: {
    id: String
  },

  run({ id }) {
    this.unblock();

    if (Meteor.isServer) {
      import { party_flags_average } from './server/lib';

      const result = partyFlagsAverage(id);
      console.log(result)
      return result;
    }

    return true;
  },
});
