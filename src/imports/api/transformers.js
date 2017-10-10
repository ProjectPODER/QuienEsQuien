import {
  mapValues,
} from 'lodash';
import hash from 'string-hash';

function nodeSize(float) {
  return (Math.sqrt((parseFloat(float) * 10) / Math.PI));
}

// const entries = (company && Object.entries(company)) || ['hola', 'mundo'];
// const sum = entries.reduce((acc, cur) => {
//   const n = +cur[1];
//   if (n) return { sum: acc.sum +n, count: acc.count +1 };
//   return acc;
// }, { sum: 0, count:0 });

export function doc2CytoNode(doc, { id, name, role, collection }) {
  const size = (10000 * doc.rank);
  return {
    group: "nodes",
    data: {
      id: id,
      name: name,
      size: (50 > size > 15) ? size : 15,
      role: role,
      collection: collection,
      source: doc.source,
      rank: doc.count,
      // data: { weight: 75 },
    },
    classes: role,
    // position: { x: 500, y: 500}
  }
}

export function doc2CytoEdge({ sourceId, targetId, label }) {
  return {
    group: 'edges',
    data: {
      id: `${sourceId}-${targetId}`,
      label: label,
      source: sourceId,
      target: targetId,
    }
  }
}

export function contractTypeNodes(types, count) {
  return mapValues(types, (v, k) => {
    return [{
      group: 'nodes',
      data: {
        id: hash(k),
        name: k,
        role: 'contractType',
        collection: 'contracts',
        size: (v/count)*100,
      }
    },
    doc2CytoEdge({
      targetId: hash(k),
      sourceId: 'o0',
    //  label: 'hola mundo',
    })]
  });
}
