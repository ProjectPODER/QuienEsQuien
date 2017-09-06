import { Revisions } from '../revisions.js';

Meteor.publish("revision", function(docId) {
  check(docId, String);
  return Revisions.find({ _id: docId })
});

Meteor.publish("documentRevisions", function(docId) {
  check(docId, String);
  return Revisions.find({ documentId: docId })
});

Meteor.publish("siteHistory", function() {
  return Revisions.find();
});
