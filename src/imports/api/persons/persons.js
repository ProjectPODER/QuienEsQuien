import {
  countBy,
  identity,
  flatten,
} from 'lodash';
import hash from 'string-hash';
import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';
import { Index, MongoDBEngine } from 'meteor/easy:search';
import Memberships from '../memberships/memberships';
import { Revisions } from '../revisions/revisions';
import PersonSchema from './schema';
import {
  getShares,
  getBoard,
  getPosts,
  getContractsSupplied,
  getAllMemberships,
} from './relations';
import {
  doc2CytoNode,
  doc2CytoEdge,
  contractTypeNodes,
} from '../transformers';

export const Persons = new Mongo.Collection('persons');

export const PersonsIndex = new Index({
  collection: Persons,
  fields: ['simple'],
  engine: new MongoDBEngine(),
});

Persons.helpers({
  collectionName() {
    return 'persons';
  },
  editableBy(userId) {
    const isAdmin = Roles.userIsInRole(userId, 'admin');
    return isAdmin || this.user_id === userId;
  },
  revisions() {
    return Revisions.find({documentId: this._id});
  },
  shares(graph = false) {
    if (!graph) {
      return getShares(this);
    }
    return getShares(this).map(doc => {
      return [
        doc2CytoNode(doc, {
          id: doc._id,
          name: doc.sob_org,
          role: 'shares',
          collection: 'organizations',
        }),
        doc2CytoEdge({
          sourceId: 'o0',
          targetId: doc._id,
          label: doc.role,
        }),
      ];
    });
  },
  allMemberships() {
    return getAllMemberships(this)
  },
  board(graph = false) {
    if (!graph) {
      return getBoard(this);
    }
    return getBoard(this).map(doc => {
      return [
        doc2CytoNode(doc, {
          id: doc._id,
          name: doc.sob_org,
          role: 'board member',
          collection: 'organizations',
        }),
        doc2CytoEdge({
          sourceId: 'o0',
          targetId: doc._id,
          label: doc.role,
        }),
      ];
    });
  },
  posts(graph = false) {
    if (!graph) {
      return getPosts(this);
    }
    return Memberships.find({
      source: /cargografias/,
      person_id: this.simple,
    }).map(doc => {
      return [
        doc2CytoNode(doc, {
          id: doc._id,
          name: doc.sob_org,
          role: doc.role,
          collection: 'organizations',
        }),
        doc2CytoEdge({
          sourceId: 'o0',
          targetId: doc._id,
          label: doc.role,
        }),
      ];
    });
  },
  contractsSupplied(graph = false) {
    if (!graph) {
      return getContractsSupplied(this);
    }
    const genericData = getContractsSupplied(this);
    const count = genericData.count();
    const types = countBy(genericData.map(o => (o.procedure_type)), identity);
    const typeNodes = contractTypeNodes(types, count);
    const output = genericData.map(doc => {
      let solicitorNode = doc2CytoNode(doc, {
        id: doc._id,
        name: doc.dependency,
        role: 'solicitor',
        collection: 'organizations',
        type: doc.procedure_type,
      });
      return [
        solicitorNode,
        doc2CytoEdge({
          sourceId: hash(doc.procedure_type),
          targetId: doc._id,
          label: doc.title,
        }),
      ];
    });
    return flatten([
      Object.values(typeNodes),
      output,
    ]);
  },
  originNode() {
    // return a node for cytoscape
    const self = this;
    return {
      data: {
        group: "nodes",
        id: 'o0',
        name: self.name,
        //size: Math.sqrt(sum.sum / sum.count) || 15,
        // data: { weight: 75 },
        // position: { x: 110, y: 110 },
      },
      classes: 'origin',
    }
  },
});

Persons.attachSchema(PersonSchema);

Persons.deny({
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
