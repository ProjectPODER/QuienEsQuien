import {
  Meteor,
} from 'meteor/meteor';
import {
  ValidatedMethod,
} from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { simpleName } from '../lib';

export const basicContractInfo = new ValidatedMethod({
  name: 'Contracts.methods.basicContractInfo',

  validate: new SimpleSchema({
    names: {
      type: Array,
      index: true,
      optional: true,
    },
    'names.$': {
      type: String,
      max: 100,
    },
    isPublic: {
      type: Boolean,
    },
  }).validator(),

  run({ names, isPublic }) {
    this.unblock();

    if (Meteor.isServer) {
      import { statAmountByYear } from './server/lib';

      let query;
      if (isPublic) {
        query = {
          dependency: {
            $regex: names.join('|'),
            $options: 'i',
          },
        };
      } else {
        query = {
          $or: [
            {
              suppliers_org: {
                $in: names.map(s => (simpleName(s))),
              },
            },
            {
              suppliers_person: {
                $in: names.map(s => (simpleName(s))),
              },
            },
          ],
        };
      }
      return statAmountByYear(query);
    }
    return null;
  },
});

export const contractsMinMax = new ValidatedMethod({
  name: 'Contracts.methods.contractsMinMax',

  validate: new SimpleSchema({
    names: {
      type: Array,
      index: true,
      optional: true,
    },
    'names.$': {
      type: String,
      max: 100,
    },
    isPublic: {
      type: Boolean,
    },
  }).validator(),

  run({ names, isPublic }) {
    this.unblock();

    if (Meteor.isServer) {
      import { statMinMax } from './server/lib';

      if (isPublic) {
        const query = {
          dependency: {
            $regex: names.join('|'),
            $options: 'i',
          },
        };
        const values = statMinMax(query);
        return values[0];
      }

      const query = {
        $or: [
          {
            suppliers_org: {
              $in: names.map(s => (simpleName(s))),
            },
          },
          {
            suppliers_person: {
              $in: names.map(s => (simpleName(s))),
            },
          },
        ],
      };
      const values = statMinMax(query);
      return values[0];
    }

    return true;
  },
});

export const contractIndexMinMax = new ValidatedMethod({
  name: 'Contracts.methods.contractIndexMinMax',

  validate: null,

  run() {
    this.unblock();

    if (Meteor.isServer) {
      import { statMinMax } from './server/lib';

      const values = statMinMax({});
      return values[0];
    }

    return true;
  },
});
