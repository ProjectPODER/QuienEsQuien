import { extend } from 'lodash';
import {
originNode,
addGeneologyNodes,
addNode,
} from './relations';

export const colaOptions = {
  name: 'cola',
  // animate: false,
  refresh: 10,
  maxSimulationTime: 6000,
  ungrabifyWhileSimulating: false,
  fit: false,
  // padding: 10,
  // boundingBox: undefined,
  // positioning options
  randomize: false,
  avoidOverlap: true,
  handleDisconnected: true,
  // flow: { axis: 'y', minSeparation: 30 },
  alignment: undefined,
  edgeLength: undefined,
  edgeSymDiffLength: undefined,
  edgeJaccardLength: undefined,
  unconstrIter: undefined,
  userConstIter: undefined,
  allConstIter: undefined,
  infinite: true,
};

export default function updateVizualization(self) {
  const doc = self.data.origin;
  self.autorun((c) => {
    if (doc) {
      c.stop();

      self.cy.add(originNode(doc));
    }
  });

  self.autorun(() => {
    let mainCallLayout = true;
    if (!self.ready.get()) {
      return;
    }
    if (doc.collection === 'persons') {
      // FIXME include contracts post I.M. merge
      const rels = [doc.board(), doc.shares()];
      getRelations(rels, self);
    }

    if (doc.collection === 'orgs') {
      // FIXME include contracts post I.M. merge
      const rels = [doc.shares(), doc.board(), doc.shareholders()];
      getRelations(rels, self);
      // suborgs
      if (doc.suborgs && doc.suborgs.length > 0) {
        doc.suborgs.forEach((e, i) => {
          const obj = { name: e };
          extend(obj, {
            role: 'suborg',
            id: `sO${i}`,
          });
          addNode(self.cy, obj, 'o0');
        });
      }
      // parents
      if (doc.immediate_parent && doc.immediate_parent !== doc.simple) {
        mainCallLayout = false;
        addGeneologyNodes(self, doc, coseOptions);
      }
    }
    if (mainCallLayout) {
      self.cy.layout(coseOptions);
    }
  });
}
