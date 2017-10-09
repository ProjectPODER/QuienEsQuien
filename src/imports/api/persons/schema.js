import SimpleSchema from 'simpl-schema';
import ReferenceSchema from '../references/references.js';
import AddressSchema from '../addresses/addresses.js';
import { imageUrlRegExp } from '../lib';

SimpleSchema.extendOptions(['autoform']);

const PersonSchemaObject = {
  source: {
    max: 25,
    type: String,
    optional: true,
  },
  user_id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  simple: {
    type: String,
    index: true,
    max: 100
  },
  names: {
    type: Array,
    index: true,
    optional: true,
  },
  'names.$': {
    type: String,
    max: 100,
  },
  name: {
    type: String,
    max: 100,
    index: true
  },
  imageUrl: {
    type: String,
    max: 200,
    regEx: imageUrlRegExp,
    optional: true,
  },
  prefix: {
    type: String,
    max: 5,
    optional: true,
  },
  suffix: {
    type: String,
    max: 5,
    optional: true,
  },
  gender: {
    type: String,
    allowedValues: ['Male', 'Female', 'Otro'],
    optional: true,
  },
  nationality: {
    type: String,
    max: 50,
    optional: true
  },
  address: {
    type: AddressSchema,
    optional: true,
  },
  date_birth: {
    type: Date,
    optional: true,
  },
  date_death: {
    type: Date,
    optional: true,
  },
  contract_count: {
    type: Number,
    optional: true
  },
  party: {
    type: String,
    max: 200,
    optional: true
  },
  party_general: {
    type: String,
    max: 200,
    optional: true
  },
  first_name: {
    type: String,
    max: 75,
    optional: true,
  },
  family_name: {
    type: String,
    max: 75,
    optional: true,
  },
  references: {
    type: Array,
    optional: true,
    autoform: {
      minCount: 1,
    },
  },
  'references.$': ReferenceSchema,
  created_at: {
    type: Date,
    optional: true,
  },
  lastModified: {
    type: Date,
    optional: true,
  },
};

export default new SimpleSchema(PersonSchemaObject);
