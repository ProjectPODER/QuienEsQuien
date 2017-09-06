import { extend, omit } from 'lodash';
import { getOrg } from '../../../api/organizations/methods';

const defaultSize = 10;

function nodeSize(float) {
  return (Math.sqrt((parseFloat(float) * 10) / Math.PI));
}

export function originNode(doc) {
  const company = doc.company;
  const size = (company && company.market_cap) && nodeSize(doc.company.market_cap);

  const origin = {
    data: {
      id: 'o0',
      name: doc.name,
      size: size || defaultSize,
    },
    classes: 'origin',
  };
  return origin;
}

function geneology(simple, gene, callback) {
  getOrg.call({
    simple,
  }, (error, result) => {
    if (error) {
      throw error;
    }
    gene.push(result);
    if (result.immediate_parent && result.immediate_parent !== result.simple) {
      return geneology(result.immediate_parent, gene, callback);
    }
    return callback(gene);
  });
}

export function addNode(cy, obj, origin, direction) {
  let size = defaultSize;
  const edgeDirection = {};

  if (obj.count) {
    // watch out for broken links
    size += nodeSize(obj.count);
  }

  if (obj.shares) {
    size += nodeSize(obj.shares);
  }

  const doc = extend({}, obj, { size });
  // add the node
  cy.add({
    data: doc,
  });

  const edgeData = {
    id: `${origin}-${obj.id}`,
    label: obj.edgeLabel,
  };

  if (direction === 1) {
    extend(edgeDirection, {
      source: doc.id,
      target: origin,
    });
  } else {
    extend(edgeDirection, {
      source: origin,
      target: doc.id,
    });
  }

  extend(edgeData, edgeDirection);
  // add the edge
  cy.add({
    data: edgeData,
  });
}

export function getRelations(array, self) {
  array.forEach((rel, n) => {
    const types = ['shares', 'board', 'shareholder'];
    const type = types[n];
    let direction;
    if (type === 'shareholder') {
      direction = 1;
    } else {
      direction = 0;
    }
    rel.fetch()
    .forEach((obj) => {
      extend(obj, { edgeLabel: type });
      const already = self.cy.getElementById(obj._id);
      const sameSob = self.cy.$(`[sob_org="${obj.sob_org}"]`);
      if (sameSob.data()) {
        // FIXME
        // deal with node details when we point to relations at the same node
        // maybe use node colores to distinguish between persons/orgs
        // and color the edge with relationship color
        // so then legend buttons would remove edges
        // and nodes would be removed when all edges are removed
        return self.cy.add({
          data: {
            id: 'edge-q33e34r',
            source: 'o0',
            target: sameSob.data().id,
            label: obj.edgeLabel,
          },
        });
      }
      if (!already.data()) {
        extend(obj, {
          id: obj._id,
        });

        return addNode(self.cy, omit(obj, '_id'), 'o0', direction);
      }
      return true;
    });
  });
}

export function addGeneologyNodes(self, doc, options) {
  geneology(doc.immediate_parent, [], (array) => {
    const presentNodes = self.cy.nodes().map(n => (n.data()));
    array.forEach((e, i) => {
      let origin;
      extend(e, {
        role: 'parent',
        id: `pP${i}`,
      });
      if (i === 0) {
        origin = 'o0';
      } else {
        origin = `pP${i - 1}`;
      }
      if (presentNodes.filter(node => (node.id === e.id)).length === 0) {
        addNode(self.cy, e, origin);
      }
    });
    self.cy.$().layout(options);
  });
}
