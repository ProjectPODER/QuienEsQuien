/*
eslint no-param-reassign: ["error",
  { "props": true, "ignorePropertyModificationsFor": ["doc", "modifier"] }
]*/
import {
  extend,
  isEqual,
  omit,
  intersection,
  keys,
} from 'lodash';
import {
  Mongo,
} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {
  Orgs,
} from '../organizations/organizations';
import {
  Persons,
} from '../persons/persons';
import {
  ReferenceSchema,
} from '../references/references';
import {
  insertRevision,
} from '../revisions/revisions';
import {
  logUserAction,
} from '../users/users';
import {
  simpleName,
} from '../lib';
import {
  statContractUpdate,
  statContractRemove,
} from '../stats/lib';

const cc = require('currency-codes');

export const Contracts = new Mongo.Collection('contracts');

Contracts.helpers({
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

Contracts.before.insert((userId, doc) => {
  doc.user_id = doc.user_id || userId;
  if (!doc.user_id) {
    throw new Error(doc);
  }
  extend(doc, { created_at: new Date() });
});

Contracts.before.upsert((userId, selector, modifier) => {
  modifier.$set = modifier.$set || {};
  modifier.$set.user_id = modifier.$set.user_id || userId;
  extend(modifier.$set, { modified_at: new Date() });
  // modifier.$set.modified_at = Date.now();
  // modifier.$set.user_id = userId;
});

Contracts.before.update((userId, doc, fieldNames, modifier) => {
  // if documents has not changed, do not update

  if (intersection(keys(modifier), ['$inc', '$addToSet'] === 0)) {
    const cleanDoc = omit(doc, ['revisionId', 'created_at']);
    const cleanMod = omit(modifier.$set, 'lastModified');

    if (isEqual(cleanDoc, cleanMod)) {
      return false;
    }
  }
  return true;
});

Contracts.after.update((userId, doc) => {
  if (!isEqual(this.previous, doc)) {
    doc.user_id = doc.user_id || userId;
    doc.simple = doc.ocid;
    const revId = insertRevision(doc.user_id, this.previous, doc, 'contracts');
    doc._id = revId;
    logUserAction(extend(doc, { action: 'update', collection: 'contracts' }));
    statContractUpdate();
  }
});

Contracts.after.insert((userId, doc) => {
  doc.simple = doc.ocid;
  logUserAction(extend(doc, { action: 'insert', collection: 'contracts' }));
  statContractUpdate(doc._id);
});

Contracts.after.remove((userId, doc) => {
  doc.simple = doc.ocid;
  logUserAction(extend(doc, { action: 'insert', collection: 'contracts' }));
  statContractRemove(doc._id);
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
