/*
eslint no-param-reassign: ["error",
  { "props": true, "ignorePropertyModificationsFor": ["doc", "modifier"] }
]*/
import {
  Mongo,
} from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import {
  Orgs,
} from '../organizations/organizations';
import {
  Persons,
} from '../persons/persons';
import {
  Revisions,
} from '../revisions/revisions';
import ReferenceSchema from '../references/references';
import {
  simpleName,
} from '../lib';

const cc = require('currency-codes');

export const Contracts = new Mongo.Collection('contracts');

Contracts.helpers({
  editableBy(userId) {
    const isAdmin = Roles.userIsInRole(userId, 'admin');
    return isAdmin || this.user_id === userId;
  },
  revisions() {
    return Revisions.find({documentId: this._id})
  },
  dependencyDocument() {
    return Orgs.findOne({
      simple: simpleName(this.dependency),
    }, {
      fields: {
        user_id: 0,
      },
      sort: {
        amount: -1,
      },
    });
  },
  departmentDocument() {
    return Orgs.findOne({
      simple: simpleName(this.department),
    }, {
      fields: {
        user_id: 0,
      },
      sort: {
        amount: -1,
      },
    });
  },
  suppliersOrg() {
    return Orgs.find({
      $or: [
        {
          simple: { $in: this.suppliers_org },
        },
        {
          simple: { $in: this.suppliers },
        },
      ],
    }, {
      fields: {
        user_id: 0,
      },
      sort: {
        amount: -1,
      },
    });
  },
  suppliersPerson() {
    return Persons.find({
      $or: [
        {
          simple: { $in: this.suppliers_person },
        },
        {
          simple: { $in: this.suppliers },
        },
      ],
    }, {
      fields: {
        user_id: 0,
      },
      sort: {
        amount: -1,
      },
    });
  },
});

const ContractSchemaObject = {
  user_id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true, // FIXME validation runs before collection-hooks
  },
  dependency: {
    type: String,
    max: 100,
    index: true,
    optional: true,
  },
  procedure_type: {
    type: String,
    allowedValues: [
      'Adjudicación Directa Federal',
      'Invitación a Cuando Menos 3 Personas',
      'Licitación Pública',
      'Otro',
      'Licitación Pública con OSD',
      'Proyecto de Convocatoria',
      'Licitación Publica Estatal',
      'Convenio',
    ],
    optional: true,
  },
  ocid: {
    type: String,
    max: 100,
    index: true,
    optional: true, // FIXME remove optional after migration 7
  },
  country: { // FIXME remove after migration 10
    type: String,
    max: 100,
    optional: true,
  },
  clave_uc: {
    type: String,
    max: 20,
    optional: true,
  },
  start_date: {
    type: Date,
    min: new Date('2013-01-01'),
    max: new Date(),
    index: true,
    sparse: true,
    optional: true,
  },
  end_date: {
    type: Date,
    min: new Date('2013-01-01'),
    max: new Date(),
    index: true,
    sparse: true,
    optional: true,
  },
  celebration: {
    type: Date,
    min: new Date('2013-01-01'),
    max: new Date(),
    optional: true,
  },
  status: {
    type: String,
    // allowedValues: ??
    optional: true,
  },
  department: {
    type: String,
    max: 100,
    index: true,
    sparse: true,
    optional: true,
  },
  title: {
    type: String,
    max: 1000,
    index: true,
    sparse: true,
  },
  type: {
    type: String,
    max: 50,
    allowedValues: [
      'Adquisiciones',
      'Arrendamientos',
      'Obra Pública',
      'Servicios',
      'Servicios Relacionados con la OP',
    ],
    index: true,
    sparse: true,
  },
  amount: {
    type: Number,
    index: true,
    sparse: true,
    min: 1,
  },
  currency: {
    type: String,
    allowedValues: cc.codes(),
  },
  suppliers: {
    // FIXME remove when we have the persons/orgs sorted out
    type: Array,
    optional: true,
  },
  'suppliers.$': {
    type: String,
    max: 250, // FIXME org.name field must match
  },
  suppliers_person: {
    type: Array,
    optional: true,
  },
  'suppliers_person.$': {
    type: String,
    max: 150,
  },
  suppliers_org: {
    type: Array,
    optional: true,
  },
  'suppliers_org.$': {
    type: String,
    max: 250,
  },
  company_status: {
    type: String,
    max: 20,
    // allowedValues??
    optional: true,
  },
  account_admin: {
    type: String,
    max: 5,
    optional: true,
  },
  character: {
    type: String,
    allowedValues: ['Nacional', 'Internacional', 'Internacional bajo TLC'],
    optional: true,
  },
  source: {
    type: String,
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

export const ContractSchema = new SimpleSchema(ContractSchemaObject);
Contracts.attachSchema(ContractSchema);

Contracts.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});
