import SimpleSchema from 'simpl-schema';

const PublicSchemaObject = {
  "initials": {
    "type": String,
  },
  "government": {
    "type": String
  }
};
/**
 * @type {Object}
 * @property {string} initials Dependency abbreviated name
 * @property {string} government level of government
*/


export const PublicSchema = new SimpleSchema(PublicSchemaObject);
