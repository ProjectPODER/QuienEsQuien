import { union, find } from 'lodash';
import Memberships from '../memberships';

const rawMemberships = Memberships.rawCollection();
rawMemberships.aggregateSync = Meteor.wrapAsync(rawMemberships.aggregate);

export function rankedSobOrg() {
  return rawMemberships.aggregateSync([
    { $group: { _id: '$sob_org', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
}

export function rankedOrgId() {
  return rawMemberships.aggregateSync([
    { $match: { org_id: { $exists: true, $ne: null } } },
    { $group: { _id: '$org_id', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
}

export function rankedPersonId() {
  return rawMemberships.aggregateSync([
    { $match: { person_id: { $exists: true, $ne: null } } },
    { $group: { _id: '$person_id', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
}

export function rankedOrgs() {
  const sobOrgsRanked = rankedSobOrg();
  const orgIdRanked = rankedOrgId();
  const u = union(
    sobOrgsRanked.map(o => (o._id)),
    orgIdRanked.map(o => (o._id)),
  );
  const allOrgs = [];

  for (let i = 0; i < u.length; i += 1) {
    const ID = u[i];
    const sob = find(sobOrgsRanked, o => (ID === o._id));
    const org = find(orgIdRanked, o => (ID === o._id));
    if (sob && org) {
      allOrgs.push({
        _id: ID,
        count: sob.count + org.count,
      });
    } else if (sob) {
      allOrgs.push({
        _id: ID,
        count: sob.count,
      });
    } else if (org) {
      allOrgs.push({
        _id: ID,
        count: org.count,
      });
    }
  }
  return allOrgs;
}
