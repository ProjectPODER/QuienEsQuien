import SimpleSchema from 'simpl-schema';
import ReferenceSchema from '../references/references.js';

SimpleSchema.extendOptions(['autoform']);

const CompanySchemaObject = {
  sector: {
    type: String,
    max: 100,
    optional: true,
  },
  classification: {
    type: String,
    max: 100,
    optional: true,
  },
  tickers: {
    type: String,
    max: 50,
    optional: true,
  },
  employees: {
    type: Number,
    optional: true,
  },
  assets: {
    type: Number,
    optional: true,
  },
  current_assets: {
    type: Number,
    optional: true,
  },
  liabilities: {
    type: Number,
    optional: true,
  },
  current_liabilities: {
    type: Number,
    optional: true,
  },
  current_ratio: {
    type: Number,
    optional: true,
  },
  quick_ratio: {
    type: Number,
    optional: true,
  },
  revenue: {
    type: Number,
    optional: true,
  },
  c_o_g_s: {
    type: Number,
    optional: true,
  },
  gross_profit: {
    type: Number,
    optional: true,
  },
  grossprofit_margin: {
    type: Number,
    optional: true,
  },
  market_cap: {
    type: Number,
    optional: true,
  },
  total_debt: {
    type: Number,
    optional: true,
  },
  'parent.name': {
    type: String,
    max: 100,
    optional: true,
    label: "Ultimate Parent Name",
  },
  'parent.address': {
    type: String,
    max: 200,
    optional: true,
    label: "Ultimate Parent Address",
  },
  references: {
    type: Array,
    optional: true,
    autoform: {
      minCount: 1,
    },
  },
  'references.$': ReferenceSchema,
};

export default new SimpleSchema(CompanySchemaObject);
