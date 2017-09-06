import { extend } from 'lodash';
import {
originNode,
getRelations,
addGeneologyNodes,
addNode,
} from './relations';

const coseOptions = {
  name: 'cola',
  animate: true,
  refresh: 1,
  maxSimulationTime: 4000,
  ungrabifyWhileSimulating: true,
  fit: true,
  // padding: 10,
  // boundingBox: undefined,
  // positioning options
  randomize: false,
  avoidOverlap: false,
  handleDisconnected: true,
  flow: undefined,
  alignment: undefined,
  edgeLength: undefined,
  edgeSymDiffLength: undefined,
  edgeJaccardLength: undefined,
  unconstrIter: undefined,
  userConstIter: undefined,
  allConstIter: undefined,
  infinite: false,
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
