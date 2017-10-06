import SimpleSchema from 'simpl-schema';
import {
  ReferenceSchema
} from '../references/references.js';

SimpleSchema.extendOptions(['autoform']);

const MembershipSchema = new SimpleSchema({
  source: {
    max: 25,
    type: String,
    optional: true,
  },
  person: {
    type: String,
    max: 100,
    optional: true
  },
  org: {
    type: String,
    max: 120,
    optional: true
  },
  person_id: {
    type: String,
    max: 100,
    index: true,
    sparse: true,
    optional: true
  },
  org_id: {
    type: String,
    max: 120,
    index: true,
    sparse: true,
    optional: true
  },
  sob_org: {
    type: String,
    max: 120,
    index: true,
    sparse: true,
    optional: true
  },
  label: {
    type: String,
    max: 100,
    optional: true
  },
  role: {
    type: String,
    max: 400,
    index: true,
    sparse: true,
    optional: true,
  },
  department: {
    type: String,
    max: 200, // largest 186
    index: true,
    sparse: true,
    optional: true
  },
  shares: {
    type: Number,
    optional: true
  },
  salary: {
    type: Number,
    optional: true
  },
  start_date: {
    type: Date,
    optional: true,
  },
  end_date: {
    type: Date,
    optional: true,
  },
  user_id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  references: {
    type: Array,
    optional: true,
    autoform: {
      minCount: 1,
    },
  },
  'references.$': ReferenceSchema,
});

export default MembershipSchema;
