import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Orgs } from './organizations.js';
import { Persons } from '../persons/persons.js';
import { AddressSchema } from '../addresses/addresses.js';
import { ReferenceSchema } from '../references/references.js';
import { OwnershipSchema } from '../ownership/ownership.js';
import { PublicSchema } from '../public/public.js';
import { CompanySchema } from '../company/company.js';

const CompetitorsSchemaObject = {
  name: {
    type: String,
    index: true,
    sparse: true,
    max: 100,
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
};

export const CompetitorsSchema = new SimpleSchema(CompetitorsSchemaObject);

const OrganizationSchemaObject = {
  source: {
    max: 20,
    type: String,
    optional: true,
  },
  user_id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  simple: {
    type: String,
    index: true,
    unique: true,
    max: 200
  },
  name: {
    type: String,
    max: 200,
    index: true
  },
  names: {
    type: Array,
    index: true,
    optional: true,
  },
  'names.$': {
    type: String,
    max: 200,
  },
  initials: {
    type: String,
    max: 15,
    optional: true
  },
  type: {
    type: String,
    max: 50,
    optional: true,
  },
  category: {
    type: String,
    allowedValues: [ 'public', 'company', 'non-profit' ],
    optional: true,
  },
  description: {
    type: String,
    max: 700,
    optional: true,
  },
  address: {
    type: AddressSchema,
    optional: true,
  },
  foundation_date: {
    type: SimpleSchema.Integer,
    min: 1366,
    max() {
      return new Date().getFullYear();
    },
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
  // organizaciones privadas
  company: {
    type: CompanySchema,
    optional: true,
  },
  // organizaciones publicas
  public: {
    type: PublicSchema,
    optional: true,
  },
  competitors: {
    type: Array,
    optional: true,
  },
  'competitors.$': CompetitorsSchema,
  contract_count: {
    type: Number,
    optional: true,
  },
  parent: {
    type: Array,
    optional: true,
  },
  'parent.$': {
    type: String,
    max: 200,
  },
  immediate_parent: {
    type: String,
    max: 200,
    optional: true,
  },
  suborgs: {
    type: Array,
    optional: true,
  },
  'suborgs.$': {
    type: String,
    max: 200,
  },
  created_at: {
    type: Date,
    optional: true,
  },
};

export const OrganizationSchema = new SimpleSchema(OrganizationSchemaObject)
