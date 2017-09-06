import SimpleSchema from 'simpl-schema';

const OwnershipSchemaObject = {
  id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  name: {
    type: String,
    index: true,
    sparse: true,
    max: 100,
    optional: true,
  },
  shares: {
    type: Number,
    optional: true,
  },
  parent: {
    type: Boolean,
    optional: true,
  },
  end_date: {
    type: Date,
    optional: true,
  },
  start_date: {
    type: Date,
    optional: true,
  },
};

/**
@type {Object}
@property {string} id unique id
@property {string} name Person/Org which has possesion over the company
@property {string} shares Number of shares of the owned company
@property {string} parent Tells if the owner of the company is the parent company
@property {date} start_date When the company bought the company
@property {date} end-date When the company stop being the owner of the company
*/

export const OwnershipSchema = new SimpleSchema(OwnershipSchemaObject);
