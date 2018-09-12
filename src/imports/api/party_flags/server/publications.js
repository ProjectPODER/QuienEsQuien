import { PartyFlags } from '../party_flags.js';

Meteor.publish("party_flags", function(_id) {
  check(_id, String);
  return PartyFlags.find(
    { "party.id": _id }
  );
});
