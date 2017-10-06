import SimpleSchema from 'simpl-schema';
import countries from './country_data';

const AddressSchemaObject = {
  street: {
    type: String,
    max: 100,
    optional: true,
  },
  number: {
    type: String,
    max: 5,
    optional: true,
  },
  zone: {
    type: String,
    max: 50,
    optional: true,
  },
  city: {
    type: String,
    max: 50,
    optional: true,
  },
  state: {
    type: String,
    max: 50,
    optional: true,
  },
  postal_code: {
    type: String,
    max: 50,
    optional: true,
  },
  country: {
    type: String,
    allowedValues: countries,
    optional: true,
  },
  telephone: { // FIXME remove after migration 5
    type: String,
    max: 25,
    optional: true,
  },
  phones: {
    type: Array,
    optional: true,
  },
  'phones.$': {
    type: String,
    max: 25,
  },
  emails: {
    type: Array,
    regEx: SimpleSchema.RegEx.Email,
    optional: true,
  },
  'emails.$': {
    type: String,
    max: 50,
  },
  website: {
    type: String,
    max: 150,
    // from accepted answer here:
    // https://stackoverflow.com/questions/8188645/javascript-regex-to-match-a-url-in-a-field-of-text
    // but I took out the protocol at the beggining
    // regEx: SimpleSchema.RegEx.WeakDomain,
    // regEx: /^[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/,
    optional: true,
  },
  ocd_id: {
    type: String,
    max: 110,
    optional: true,
  },
};

export default new SimpleSchema(AddressSchemaObject)
