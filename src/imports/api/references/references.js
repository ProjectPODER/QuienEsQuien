import SimpleSchema from 'simpl-schema';

const ReferenceSchemaObject = {
  name: {
    type: String,
    max: 100,
    optional: true,
  },
  url: {
    type: String,
    max: 200,
    regEx: /^[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/,
    optional: true,
  },
  author: {
    type: String,
    max: 100,
    optional: true,
  },
  publication_date: {
    type: String,
    optional: true,
  },
  publication_place: {
    type: String,
    optional: true,
  },
  field: {
    type: String,
    max: 200,
    optional: true,
  },
};

export const ReferenceSchema = new SimpleSchema(ReferenceSchemaObject);
