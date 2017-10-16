import {
  has,
  countBy,
  identity,
  flatten,
} from 'lodash';
import hash from 'string-hash';
import {
  Mongo
} from 'meteor/mongo';
import {
  Roles
} from 'meteor/alanning:roles';
import {
  Index,
  MongoDBEngine
} from 'meteor/easy:search';
import {
  Revisions
} from '../revisions/revisions';
import OrganizationSchema from './schema';
import {
  getShareHolders,
  getShares,
  getBoard,
  getContractsSupplied,
  getContractsSolicited,
  getPosts,
  getAllMemberships,
} from './relations';
import {
  doc2CytoNode,
  doc2CytoEdge,
  contractTypeNodes,
} from '../transformers';

export const Orgs = new Mongo.Collection('organizations');

export const OrgsIndex = new Index({
  collection: Orgs,
  fields: ['simple'],
  engine: new MongoDBEngine(),
});

Orgs.helpers({
  collectionName() {
    return 'organizations';
  },
  editableBy(userId) {
    const isAdmin = Roles.userIsInRole(userId, 'admin');
    return (this.user_id) && (isAdmin || this.user_id === userId);
  },
  isPublic() {
    return (has(this, 'public') || this.category === 'public');
  },
  revisions() {
    return Revisions.find({documentId: this._id})
  },
  shareholders(graph = false) {
    if (!graph) {
      return getShareHolders(this);
    }
    return getShareHolders(this).map(doc => {
      const  isPerson = (doc.hasOwnProperty('person_id'));
      const name = (isPerson) ? doc.person_id : doc.org_id;
      const collection = (isPerson) ? 'persons' : 'organizations';
      return [
        doc2CytoNode(doc, {
          id: doc._id,
          name: name,
          role: 'shareholder',
          collection: collection,
        }),
        doc2CytoEdge({
          targetId: 'o0',
          sourceId: doc._id,
          label: 'shareholder',
        }),
      ];
    });
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
          label: 'shares',
        }),
      ];
    });
  },
  allMemberships() {
    return getAllMemberships(this)
  },
  posts(graph = false) {
    if (!graph) {
      return getPosts(this);
    }
    return getPosts(this).map(doc => {
      return [
        doc2CytoNode(doc, {
          id: doc._id,
          name: doc.person_id,
          role: doc.role,
          collection: 'persons',
        }),
        doc2CytoEdge({
          sourceId: 'o0',
          targetId: doc._id,
          label: doc.role,
        }),
      ];
    });
  },
  board(graph = false) {
    if (!graph) {
      return getBoard(this);
    }
    return getBoard(this).map(doc => {
      return [
        doc2CytoNode(doc, {
          id: doc._id,
          name: doc.person,
          role: 'board member',
          collection: 'persons',
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
    const solicitors = getContractsSupplied(this).map(doc => {
      return [
        doc2CytoNode(doc, {
          id: hash(doc.dependency),
          name: doc.dependency,
          role: 'solicitor',
          collection: 'organizations',
        }),
        doc2CytoEdge({
          sourceId: hash(doc.procedure_type),
          targetId: hash(doc.dependency),
          label: doc.title,
        }),
      ];
    });
    return flatten([
      Object.values(typeNodes),
      solicitors,
    ])
  },
  contractsSolicited(graph = false) {
    if (!graph) {
      return getContractsSolicited(this);
    }
    const genericData = getContractsSolicited(this);
    const count = genericData.count();
    const types = countBy(genericData.map(o => (o.procedure_type)), identity);
    const typeNodes = contractTypeNodes(types, count);
    const suppliers = genericData.map((doc) => {
      const output = [];
      ['person', 'org'].forEach((string) => {
        const collection = (string === 'person') ? 'persons' : 'organizations';
        const attrString = `suppliers_${string}`;
        if (doc.hasOwnProperty(attrString)) {
          doc[attrString].forEach((supplier) => {
            output.push(doc2CytoNode(doc, {
              id: hash(supplier),
              name: supplier,
              role: 'supplier',
              collection,
              type: doc.procedure_type,
            }));
            output.push(doc2CytoEdge({
                sourceId: hash(doc.procedure_type),
                targetId: hash(supplier),
                label: doc.title,
              }));
          });
        }

      });
      return output;
    });
    return flatten([
      Object.values(typeNodes),
      suppliers,
    ]);
  },
  getSubOrgs() {

  },
  getParents() {
    // role: parent
  },
  getChildren() {

  },
  originNode() {
    // return a node for cytoscape
    return {
      data: {
        group: "nodes",
        id: 'o0',
        name: this.name,
        //size: Math.sqrt(sum.sum / sum.count) || 15,
        // data: { weight: 75 },
        // position: { x: 110, y: 110 },
      },
      classes: 'origin',
    }
  },
});

Orgs.attachSchema(OrganizationSchema);

Orgs.deny({
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
