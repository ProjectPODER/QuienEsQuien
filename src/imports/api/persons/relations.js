import Memberships from '../memberships/memberships';
import { Contracts } from '../contracts/contracts';

export function getShares(doc) {
  return Memberships.find({
    role: 'shareholder',
    person_id: doc.simple,
  }, {
    sort: {
      sob_org: 1,
    },
  });
}

export function getBoard(doc) {
  return Memberships.find({
    department: 'board',
    person_id: doc.simple,
  }, {
    sort: {
      sob_org: 1,
    },
  });
}

export function getContractsSupplied(doc) {
  return Contracts.find({
    suppliers_person: doc.simple,
  }, {
    fields: {
      user_id: 0,
    },
    sort: {
      amount: -1,
    },
  });
}

export function getAllMemberships(doc) {
  return Memberships.find({
    person_id: doc.simple,
  });
}

export function getPosts(doc) {
  return Memberships.find({
    source: /cargografias/,
    person_id: doc.simple,
  });
}
