import Memberships from '../memberships/memberships';
import { Contracts } from '../contracts/contracts';

export function getShareHolders(doc) {
  return Memberships.find({
    role: 'shareholder',
    sob_org: doc.simple,
  }, {
    fields: {
      user_id: 0,
      // sob_org: 0,
    },
    sort: {
      person_id: 1,
      org_id: 1,
    },
  });
}

export function getShares(doc) {
  return Memberships.find({
    role: 'shareholder',
    org_id: doc.simple,
  }, {
    fields: {
      user_id: 0,
      org: 0,
      // org_id: 0,
    },
    sort: {
      sob_org: 1,
    },
  });
}

export function getBoard(doc) {
  return Memberships.find({
    department: 'board',
    sob_org: doc.simple,
  }, {
    fields: {
      user_id: 0,
      // sob_org: 0,
    },
    sort: {
      person_id: 1,
    },
  });
}

export function getContractsSupplied(doc) {
  return Contracts.find({
    $or: [
      { suppliers: doc.simple },
      { suppliers_org: doc.simple },
      { proveedor: doc.simple },
    ],
  }, {
    fields: {
      user_id: 0,
    },
    sort: {
      amount: -1,
    },
  });
}

export function getContractsSolicited(doc) {
  // solicits contracts (contracts organization x...)
  return Contracts.find({
    $or: [ // should we use simple?
      {
        dependency: {
          $regex: doc.name,
          $options: 'i',
        },
      },
      {
        department: {
          $regex: doc.name,
          $options: 'i',
        },
      },
    ],
  }, {
    fields: {
      user_id: 0,
    },
  });
}

export function getAllMemberships(doc) {
  return Memberships.find({
    person_id: doc.simple,
  });
}

export function getPosts(doc) {
  const posts = Memberships.find({
    source: /cargografias/,
    sob_org: doc.simple,
  });
  return posts;
}
